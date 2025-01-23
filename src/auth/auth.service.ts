import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { UserEntity } from 'src/user/entities/user.entity/user.entity';
import { REDIS_CLIENT } from 'src/providers/redis.provider';
import { Redis } from 'ioredis';
import { REDIS_KEY_PREFIXES, REDIS_TTL } from 'src/common/constants/redis.constant';
import { LoginResponseDto } from './dto/login-response.dto';
import { Request } from 'express';

/**
 * Service handling authentication operations including login, logout, and token management
 * Uses Redis to store active tokens with a maximum of 3 tokens per user
 */
@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
        @Inject(REDIS_CLIENT) private readonly redis: Redis,
    ) {}

    /**
     * Authenticates user and generates access token
     * Manages token storage in Redis with a limit of 3 active tokens per user
     */
    async login(loginDto: LoginDto) {
        this.logger.log(`Login attempt for user: ${loginDto.email}`);
        
        const user = await this.userService.findByEmail(loginDto.email);
        if (!user) {    
            this.logger.warn(`Login failed: User not found - ${loginDto.email}`);
            throw new UnauthorizedException('Invalid credentials');
        }
        
        const isPasswordValid = await bcrypt.compare(
            loginDto.password,
            user.password,
        );
      
        if (!isPasswordValid) {
            this.logger.warn(`Login failed: Invalid password for user - ${loginDto.email}`);
            throw new UnauthorizedException('Invalid credentials');
        }
      
        const access_token = await this.generateToken(user);
        
        const userKey = `${REDIS_KEY_PREFIXES.AUTH}${user.id}`;
        const tokens = await this.redis.smembers(userKey);

        // Token rotation: remove oldest token if limit reached
        if(tokens.length >= 3){
            this.logger.debug(`Rotating tokens for user: ${user.email}`);
            const oldestToken = tokens[0];
            await this.redis.srem(userKey, oldestToken);
        }   

        await this.redis.sadd(userKey, access_token);
        await this.redis.expire(userKey, REDIS_TTL.AUTH_TOKEN);

        this.logger.log(`Login successful for user: ${user.email}`);

        const loginResponseDto = new LoginResponseDto();
        loginResponseDto.access_token = access_token;
        loginResponseDto.user = {
            id: user.id,
            email: user.email,
            role: user.role,
        };
    
        return loginResponseDto;
    }

    /**
     * Logs out user by removing their current token from Redis
     */
    async logout(request) {
        const token = request.headers.authorization?.split(' ')[1];
        if (!token) {
            this.logger.warn('Logout attempt without token');
            throw new UnauthorizedException('Token not found');
        }

        const userId = request.user.id; 
        const userKey = `${REDIS_KEY_PREFIXES.AUTH}${userId}`;
        await this.redis.srem(userKey, token);
        this.logger.log(`User logged out successfully: ${request.user.email}`);
    }   

    /**
     * Logs out user from all devices by removing all their tokens from Redis
     */
    async logoutAll(request) {
        const userId = request.user.id; 
        const userKey = `${REDIS_KEY_PREFIXES.AUTH}${userId}`;
        await this.redis.del(userKey);
        this.logger.log(`User logged out from all devices: ${request.user.email}`);
    }

    /**
     * Generates JWT token with user information
     */
    async generateToken(user: UserEntity) {
        this.logger.debug(`Generating token for user: ${user.email}`);
        const payload = { 
            sub: user.id, 
            email: user.email,
            role: user.role 
        };
        return this.jwtService.signAsync(payload);
    }
}
