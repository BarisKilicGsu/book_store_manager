import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export default registerAs('jwt', (): JwtModuleOptions => ({
  secret: process.env.JWT_SECRET,
  signOptions: {
    expiresIn: process.env.JWT_EXPIRES_IN || '3d',
   // issuer: process.env.JWT_ISSUER || 'book_manager',
   // audience: process.env.JWT_AUDIENCE || 'book_manager_client',
  },
}));  