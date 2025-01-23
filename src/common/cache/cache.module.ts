import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../user/entities/user.entity/user.entity';
import { CacheService } from './cache.service';
import { redisProvider } from '../../providers/redis.provider';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
  ],
  providers: [CacheService, redisProvider],
  exports: [CacheService],
})
export class CacheModule {} 