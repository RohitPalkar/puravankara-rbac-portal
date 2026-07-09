import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const { combine, timestamp, printf, colorize, json } = winston.format;

const prettyFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  printf(({ level, message, timestamp, context, ...meta }) => {
    const ctx = context ? `[${context}]` : '';
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} ${level} ${ctx} ${message}${metaStr}`;
  }),
);

@Injectable()
export class AppLogger implements LoggerService {
  private logger: winston.Logger;

  constructor(context?: string) {
    const logLevel = process.env.LOG_LEVEL || 'debug';
    const logFormat = process.env.LOG_FORMAT || 'pretty';
    const isProduction = process.env.NODE_ENV === 'production';

    const transports: winston.transport[] = [new winston.transports.Console()];

    if (isProduction) {
      transports.push(
        new DailyRotateFile({
          filename: 'logs/app-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '14d',
          level: 'info',
          format: json(),
        }),
        new DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '30d',
          level: 'error',
          format: json(),
        }),
      );
    }

    this.logger = winston.createLogger({
      level: logLevel,
      defaultMeta: { context },
      format: logFormat === 'json' ? json() : prettyFormat,
      transports,
    });
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }
}
