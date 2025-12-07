import { Injectable, LoggerService as NestLoggerService, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface LogContext {
  requestId?: string;
  userId?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  duration?: number;
  error?: string;
  stack?: string;
  [key: string]: unknown;
}

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService implements NestLoggerService {
  private context?: string;
  private isProduction: boolean;

  constructor(private readonly configService: ConfigService) {
    this.isProduction = configService.get('NODE_ENV') === 'production';
  }

  setContext(context: string): void {
    this.context = context;
  }

  log(message: string, context?: LogContext | string): void {
    this.writeLog('info', message, context);
  }

  error(message: string, trace?: string, context?: LogContext | string): void {
    const ctx = typeof context === 'string' ? { context } : context || {};
    if (trace) {
      ctx.stack = trace;
    }
    this.writeLog('error', message, ctx);
  }

  warn(message: string, context?: LogContext | string): void {
    this.writeLog('warn', message, context);
  }

  debug(message: string, context?: LogContext | string): void {
    this.writeLog('debug', message, context);
  }

  verbose(message: string, context?: LogContext | string): void {
    this.writeLog('verbose', message, context);
  }

  private writeLog(level: string, message: string, context?: LogContext | string): void {
    const timestamp = new Date().toISOString();
    const logContext = typeof context === 'string' ? { context } : context || {};
    const contextName = this.context || logContext.context || 'Application';

    if (this.isProduction) {
      // JSON format for production (easier to parse in log aggregators)
      const logEntry = {
        timestamp,
        level,
        context: contextName,
        message,
        ...logContext,
      };
      console.log(JSON.stringify(logEntry));
    } else {
      // Pretty format for development
      const contextStr = `[${contextName}]`;
      const levelStr = level.toUpperCase().padEnd(7);
      const coloredLevel = this.colorLevel(level, levelStr);

      let logMessage = `${timestamp} ${coloredLevel} ${contextStr} ${message}`;

      if (Object.keys(logContext).length > 0 && logContext.context === undefined) {
        logMessage += ` ${JSON.stringify(logContext)}`;
      }

      console.log(logMessage);
    }
  }

  private colorLevel(level: string, text: string): string {
    const colors: Record<string, string> = {
      error: '\x1b[31m',   // Red
      warn: '\x1b[33m',    // Yellow
      info: '\x1b[32m',    // Green
      debug: '\x1b[36m',   // Cyan
      verbose: '\x1b[35m', // Magenta
    };
    const reset = '\x1b[0m';
    return `${colors[level] || ''}${text}${reset}`;
  }
}
