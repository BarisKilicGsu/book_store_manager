import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Role } from '../common/constants/role.enum';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    logout: jest.fn(),
    logoutAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockLoginResponse = {
      access_token: 'mock.jwt.token',
      user: {
        id: 1,
        email: loginDto.email,
        role: Role.USER,
      },
    };

    it('should successfully login user', async () => {
      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual(mockLoginResponse);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('logout', () => {
    const mockRequest = {
      user: { id: 1, email: 'test@example.com' },
      headers: { authorization: 'Bearer token' },
    };

    it('should successfully logout user', async () => {
      await controller.logout(mockRequest);

      expect(mockAuthService.logout).toHaveBeenCalledWith(mockRequest);
    });
  });

  describe('logoutAll', () => {
    const mockRequest = {
      user: { id: 1, email: 'test@example.com' },
    };

    it('should successfully logout user from all devices', async () => {
      await controller.logoutAll(mockRequest);

      expect(mockAuthService.logoutAll).toHaveBeenCalledWith(mockRequest);
    });
  });
});
