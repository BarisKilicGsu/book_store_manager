import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const loggerConfig = configService.get('logger');
        
        return {
          transports: [
            // Console Transport
            new winston.transports.Console({
              level: loggerConfig.consoleLevel,
              format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.colorize(),
                winston.format.printf(({ timestamp, level, message, context }) => {
                  return `${timestamp} [${context}] ${level}: ${message}`;
                }),
              ),
            }),
            // Rotating File Transport for errors
            new winston.transports.DailyRotateFile({
              filename: `${loggerConfig.directory}/error-%DATE%.log`,
              datePattern: 'YYYY-MM-DD',
              zippedArchive: true,
              maxSize: loggerConfig.fileMaxSize,
              maxFiles: loggerConfig.maxFiles,
              level: 'error',
              format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
              ),
            }),
            // Rotating File Transport for all logs
            new winston.transports.DailyRotateFile({
              filename: `${loggerConfig.directory}/combined-%DATE%.log`,
              datePattern: 'YYYY-MM-DD',
              zippedArchive: true,
              maxSize: loggerConfig.fileMaxSize,
              maxFiles: loggerConfig.maxFiles,
              format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
              ),
            }),
          ],
          // Global log level
          level: loggerConfig.level,
        };
      },
    }),
  ],
})
export class LoggerModule {} 