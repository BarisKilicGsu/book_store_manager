import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { REDIS_KEY_PREFIXES, REDIS_TTL } from "src/common/constants/redis.constant";
import Redis from "ioredis";
import { REDIS_CLIENT } from "src/providers/redis.provider";
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @Inject(REDIS_CLIENT) private readonly redis: Redis,
    ){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET,
            passReqToCallback: true,
        });
    }

    async validate(request: Request, payload: any) {
        const userKey = `${REDIS_KEY_PREFIXES.AUTH}${payload.sub}`;
        const token = request.headers.authorization?.split(' ')[1];

        if (!token) {
            throw new UnauthorizedException('Token not found');
        }

        // Check if token exists in user's set
        const isTokenValid = await this.redis.sismember(userKey, token);

        if (!isTokenValid) {
            throw new UnauthorizedException('Token is not valid');
        }

        // Refresh expiry time
        await this.redis.expire(userKey, REDIS_TTL.AUTH_TOKEN);

        return { 
            id: payload.sub, 
            email: payload.email,
        };
    }
}
