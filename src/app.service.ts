import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Redis } from 'ioredis';
import { REDIS_CLIENT } from './providers/redis.provider';

@Injectable()
export class AppService {
  constructor(
    private dataSource: DataSource,
    @Inject(REDIS_CLIENT) private redisClient: Redis,
  ) {}
 
  /**
   * Checks the health of database and Redis connections
   * @returns 'OK' if all connections are healthy
   * @throws InternalServerErrorException if any connection fails
   */
  
  async healthCheck(): Promise<string> {
    const dbConnection = await this.dataSource.isInitialized;
    const redisConnection = await this.redisClient.ping();
    if(!dbConnection || !redisConnection){
      throw new InternalServerErrorException('Database or Redis connection failed');
    }
    return 'OK';
  }
}

