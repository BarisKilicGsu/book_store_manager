import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { Role } from '../common/constants/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CacheService } from '../common/cache/cache.service';

jest.mock('../auth/guards/jwt-auth.guard');
jest.mock('../auth/guards/roles.guard');

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockUserService = {
    getUsers: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
  };

  const mockCacheService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUsers', () => {
    const getUsersDto: GetUsersDto = {
      page: 1,
      limit: 10,
      search: 'test',
      role: Role.USER,
    };

    const mockUsers = {
      data: [
        {
          id: 1,
          email: 'test@example.com',
          role: Role.USER,
        },
      ],
      meta: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    };

    it('should return paginated users', async () => {
      mockUserService.getUsers.mockResolvedValue(mockUsers);

      const result = await controller.getUsers(getUsersDto);

      expect(result).toEqual(mockUsers);
      expect(mockUserService.getUsers).toHaveBeenCalledWith(getUsersDto);
    });
  });

  describe('createUser', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password123',
      role: Role.USER,
    };

    const mockUser = {
      id: 1,
      email: createUserDto.email,
      role: createUserDto.role,
    };

    it('should create a new user', async () => {
      mockUserService.createUser.mockResolvedValue(mockUser);

      const result = await controller.createUser(createUserDto);

      expect(result).toEqual(mockUser);
      expect(mockUserService.createUser).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('updateUser', () => {
    const userId = 1;
    const updateUserDto: UpdateUserDto = {
      role: Role.STORE_MANAGER,
      storeIds: [1, 2],
    };

    const mockUser = {
      id: userId,
      email: 'test@example.com',
      role: updateUserDto.role,
    };

    it('should update user', async () => {
      mockUserService.updateUser.mockResolvedValue(mockUser);

      const result = await controller.updateUser(userId, updateUserDto);

      expect(result).toEqual(mockUser);
      expect(mockUserService.updateUser).toHaveBeenCalledWith(userId, updateUserDto);
    });
  });
});
