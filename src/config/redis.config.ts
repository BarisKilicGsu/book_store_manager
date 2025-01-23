import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT, 10),
  ttl: parseInt(process.env.REDIS_TTL, 10) || 86400, // 1 day in seconds
})); 