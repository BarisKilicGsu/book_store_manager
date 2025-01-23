import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { redisProvider } from 'src/providers/redis.provider';
import { JwtStrategy } from './strategies/jwt.strategy';
import jwtConfig from 'src/config/jwt.config';
import { CacheModule } from 'src/common/cache/cache.module';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    UserModule,
    CacheModule,
    ConfigModule.forFeature(jwtConfig), 
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('jwt')
      }),
    }), 
  ],
  controllers: [AuthController],
  providers: [AuthService, redisProvider, JwtStrategy, RolesGuard],
  exports: [AuthService, RolesGuard]
})
export class AuthModule {}
