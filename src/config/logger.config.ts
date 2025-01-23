import { registerAs } from '@nestjs/config';

export default registerAs('logger', () => ({
  level: process.env.LOG_LEVEL || 'debug',
  fileMaxSize: process.env.LOG_FILE_MAX_SIZE || '20m',
  maxFiles: process.env.LOG_MAX_FILES || '14d',
  directory: process.env.LOG_DIRECTORY || 'logs',
  consoleLevel: process.env.LOG_CONSOLE_LEVEL || 'debug',
})); 