import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private isProduction: boolean;

  constructor(private readonly configService: ConfigService) {
    this.isProduction = configService.get('NODE_ENV') === 'production';
  }

  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('User-Agent') || '';
    const requestId = req.requestId;

    // Log response when finished
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const { statusCode } = res;
      const contentLength = res.get('Content-Length') || 0;

      const logEntry = {
        timestamp: new Date().toISOString(),
        level: statusCode >= 400 ? 'warn' : 'info',
        context: 'HTTP',
        message: `${method} ${originalUrl} ${statusCode} ${duration}ms`,
        requestId,
        method,
        url: originalUrl,
        statusCode,
        duration,
        contentLength,
        ip,
        userAgent: this.isProduction ? undefined : userAgent,
      };

      // Remove undefined values
      Object.keys(logEntry).forEach(key => {
        if (logEntry[key as keyof typeof logEntry] === undefined) {
          delete logEntry[key as keyof typeof logEntry];
        }
      });

      if (this.isProduction) {
        console.log(JSON.stringify(logEntry));
      } else {
        const statusColor = statusCode >= 500 ? '\x1b[31m' : statusCode >= 400 ? '\x1b[33m' : '\x1b[32m';
        const reset = '\x1b[0m';
        console.log(
          `${logEntry.timestamp} ${statusColor}${method.padEnd(7)}${reset} ${originalUrl} ${statusColor}${statusCode}${reset} ${duration}ms`
        );
      }
    });

    next();
  }
}
