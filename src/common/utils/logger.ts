import winston from 'winston';
import path from 'path';

const { combine, timestamp, errors, json, simple, colorize } = winston.format;

const logger = winston.createLogger({
  level: 'info',
  format: combine(timestamp(), json(), errors({ stack: true })),
  transports: [
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'error.log'),
      level: 'error',
    }),
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'app.log'),
    }),
    new winston.transports.Console({
      format: combine(colorize(), simple()),
    }),
  ],
  exitOnError: false,
});

export default logger;
