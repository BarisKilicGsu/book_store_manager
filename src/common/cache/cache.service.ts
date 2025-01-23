import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity/user.entity';
import { REDIS_CLIENT } from '../../providers/redis.provider';
import { Redis } from 'ioredis';
import { REDIS_KEY_PREFIXES } from '../constants/redis.constant';

interface CachedUserData {
  id: number;
  role: string;
  storeIds: string[];
}

@Injectable()
export class CacheService implements OnModuleInit {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async onModuleInit() {
    await this.cacheUsers();
  }

  async cacheUsers() {
    // Fetch all users with their store relationships
    const users = await this.userRepository.find({
      relations: ['storeManagerStores', 'storeManagerStores.bookstore'],
    });

    // Create a Redis hash with user data
    const usersCacheKey = REDIS_KEY_PREFIXES.USERS;
    
    // Delete existing cache if any
    await this.redis.del(usersCacheKey);

    // Cache each user's data with minimal information
    for (const user of users) {
      const userData = {
        id: user.id,
        role: user.role,
        storeIds: user.storeManagerStores?.map(sms => sms.bookstore.id) || [],
      };

      // Store user data in Redis hash
      await this.redis.hset(usersCacheKey, user.id, JSON.stringify(userData));
    }
    
    console.log('Users cached in Redis successfully');
  }

  async getCachedUser(userId: string): Promise<CachedUserData | null> {
    const usersCacheKey = REDIS_KEY_PREFIXES.USERS;
    const userData = await this.redis.hget(usersCacheKey, userId);
    return userData ? JSON.parse(userData) : null;
  }
} 