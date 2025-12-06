import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly configService: ConfigService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const isProduction = this.configService.get('NODE_ENV') === 'production';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode = 'INTERNAL_ERROR';

    // Handle HTTP exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();

      if (typeof errorResponse === 'object' && errorResponse !== null) {
        message = (errorResponse as any).message || exception.message;
      } else {
        message = errorResponse as string;
      }

      errorCode = exception.constructor.name.replace('Exception', '').toUpperCase();
    }
    // Handle Prisma errors
    else if (exception instanceof PrismaClientKnownRequestError) {
      status = this.getPrismaErrorStatus(exception.code);
      message = this.getPrismaErrorMessage(exception.code);
      errorCode = `PRISMA_${exception.code}`;

      // Log Prisma errors for debugging
      this.logger.error(`Prisma error ${exception.code}: ${exception.message}`, {
        code: exception.code,
        meta: exception.meta,
        stack: exception.stack,
      });
    }
    // Handle validation errors
    else if (exception instanceof Error) {
      if (exception.message.includes('validation')) {
        status = HttpStatus.BAD_REQUEST;
        message = isProduction ? 'Validation failed' : exception.message;
        errorCode = 'VALIDATION_ERROR';
      } else {
        message = isProduction ? 'Internal server error' : exception.message;
        errorCode = 'UNKNOWN_ERROR';
      }
    }

    // Create error response with request ID for debugging
    const errorResponse = {
      statusCode: status,
      message,
      error: errorCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      requestId: request.requestId,
    };

    // Add stack trace in non-production environments
    if (!isProduction && exception instanceof Error) {
      (errorResponse as any).stack = exception.stack;
    }

    // Log error with context
    const logContext = {
      statusCode: status,
      method: request.method,
      url: request.url,
      userAgent: request.get('User-Agent'),
      ip: request.ip,
      userId: (request as any).user?.id,
      requestId: request.requestId,
    };

    if (status >= 500) {
      this.logger.error(`${request.method} ${request.url}`, exception, logContext);
    } else {
      this.logger.warn(`${request.method} ${request.url} - ${message}`, logContext);
    }

    response.status(status).json(errorResponse);
  }

  private getPrismaErrorStatus(code: string): number {
    switch (code) {
      case 'P2002': // Unique constraint violation
        return HttpStatus.CONFLICT;
      case 'P2025': // Record not found
        return HttpStatus.NOT_FOUND;
      case 'P2003': // Foreign key constraint violation
        return HttpStatus.BAD_REQUEST;
      case 'P2004': // Constraint violation
        return HttpStatus.BAD_REQUEST;
      case 'P2011': // Null constraint violation
        return HttpStatus.BAD_REQUEST;
      case 'P2012': // Missing required value
        return HttpStatus.BAD_REQUEST;
      case 'P2013': // Missing required argument
        return HttpStatus.BAD_REQUEST;
      case 'P2014': // Invalid ID
        return HttpStatus.BAD_REQUEST;
      case 'P2015': // Record not found
        return HttpStatus.NOT_FOUND;
      case 'P2016': // Query interpretation error
        return HttpStatus.BAD_REQUEST;
      case 'P2017': // Records not connected
        return HttpStatus.BAD_REQUEST;
      case 'P2018': // Required connected records not found
        return HttpStatus.BAD_REQUEST;
      case 'P2019': // Input error
        return HttpStatus.BAD_REQUEST;
      case 'P2020': // Value out of range
        return HttpStatus.BAD_REQUEST;
      case 'P2021': // Table does not exist
        return HttpStatus.INTERNAL_SERVER_ERROR;
      case 'P2022': // Column does not exist
        return HttpStatus.INTERNAL_SERVER_ERROR;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }

  private getPrismaErrorMessage(code: string): string {
    switch (code) {
      case 'P2002':
        return 'A record with this data already exists';
      case 'P2025':
        return 'Record not found';
      case 'P2003':
        return 'Invalid reference to related record';
      case 'P2004':
        return 'A constraint failed on the database';
      case 'P2011':
        return 'Null constraint violation on the database';
      case 'P2012':
        return 'Missing a required value';
      case 'P2013':
        return 'Missing the required argument';
      case 'P2014':
        return 'The change you are trying to make would violate the required relation';
      case 'P2015':
        return 'A related record could not be found';
      case 'P2016':
        return 'Query interpretation error';
      case 'P2017':
        return 'The records for relation are not connected';
      case 'P2018':
        return 'The required connected records were not found';
      case 'P2019':
        return 'Input error';
      case 'P2020':
        return 'Value out of range for the type';
      case 'P2021':
        return 'The table does not exist in the current database';
      case 'P2022':
        return 'The column does not exist in the current database';
      default:
        return 'Database error occurred';
    }
  }
}
