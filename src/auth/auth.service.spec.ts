import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { REDIS_CLIENT } from '../providers/redis.provider';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role } from '../common/constants/role.enum';
import { REDIS_KEY_PREFIXES } from '../common/constants/redis.constant';
import { UserEntity } from '../user/entities/user.entity/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let userService: UserService;
  let redisClient: any;

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockUserService = {
    findByEmail: jest.fn(),
  };

  const mockRedisClient = {
    smembers: jest.fn(),
    sadd: jest.fn(),
    srem: jest.fn(),
    expire: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: REDIS_CLIENT,
          useValue: mockRedisClient,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    userService = module.get<UserService>(UserService);
    redisClient = module.get(REDIS_CLIENT);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockUser = {
      id: 1,
      email: loginDto.email,
      password: 'hashedPassword',
      role: Role.USER,
    };

    const mockToken = 'mock.jwt.token';

    it('should successfully login user', async () => {
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue(mockToken);
      mockRedisClient.smembers.mockResolvedValue([]);

      const result = await service.login(loginDto);

      expect(result.access_token).toBe(mockToken);
      expect(result.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
      expect(mockRedisClient.sadd).toHaveBeenCalledWith(
        `${REDIS_KEY_PREFIXES.AUTH}${mockUser.id}`,
        mockToken
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should rotate tokens if limit reached', async () => {
      const existingTokens = ['token1', 'token2', 'token3'];
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue(mockToken);
      mockRedisClient.smembers.mockResolvedValue(existingTokens);

      await service.login(loginDto);

      expect(mockRedisClient.srem).toHaveBeenCalledWith(
        `${REDIS_KEY_PREFIXES.AUTH}${mockUser.id}`,
        existingTokens[0]
      );
      expect(mockRedisClient.sadd).toHaveBeenCalledWith(
        `${REDIS_KEY_PREFIXES.AUTH}${mockUser.id}`,
        mockToken
      );
    });
  });

  describe('logout', () => {
    const mockRequest = {
      headers: {
        authorization: 'Bearer mock.token',
      },
      user: {
        id: 1,
        email: 'test@example.com',
      },
    };

    it('should successfully logout user', async () => {
      await service.logout(mockRequest);

      expect(mockRedisClient.srem).toHaveBeenCalledWith(
        `${REDIS_KEY_PREFIXES.AUTH}1`,
        'mock.token'
      );
    });

    it('should throw UnauthorizedException if no token provided', async () => {
      const requestWithoutToken = {
        headers: {},
        user: mockRequest.user,
      };

      await expect(service.logout(requestWithoutToken)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logoutAll', () => {
    const mockRequest = {
      user: {
        id: 1,
        email: 'test@example.com',
      },
    };

    it('should successfully logout user from all devices', async () => {
      await service.logoutAll(mockRequest);

      expect(mockRedisClient.del).toHaveBeenCalledWith(
        `${REDIS_KEY_PREFIXES.AUTH}1`
      );
    });
  });

  describe('generateToken', () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      role: Role.USER,
      password: 'hashedPassword',
      storeManagerStores: [],
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as UserEntity;

    it('should generate token with correct payload', async () => {
      const mockToken = 'mock.jwt.token';
      mockJwtService.signAsync.mockResolvedValue(mockToken);

      const result = await service.generateToken(mockUser);

      expect(result).toBe(mockToken);
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
    });
  });
});
