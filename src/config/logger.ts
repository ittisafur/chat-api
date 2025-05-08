import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';

const logDir = 'logs';

const dailyRotateFileTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, '%DATE%-app.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
  ),
  defaultMeta: { service: 'chat-api' },
  transports: [
    dailyRotateFileTransport,
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          ({ timestamp, level, message, ...meta }) =>
            `${timestamp} ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`,
        ),
      ),
    }),
  ],
});

export default logger;
