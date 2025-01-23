import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity/user.entity';
import { StoreManagerStoreEntity } from '../stores/entities/store-manager-store.entity/store-manager-store.entity';
import { BookstoreEntity } from '../stores/entities/bookstore.entity/bookstore.entity';
import { Repository } from 'typeorm';
import { Role } from '../common/constants/role.enum';
import { ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersSortBy } from './dto/get-users.dto';
import { OrderDirection } from '../common/dto/pagination.dto';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<UserEntity>;
  let storeManagerStoreRepository: Repository<StoreManagerStoreEntity>;
  let bookstoreRepository: Repository<BookstoreEntity>;

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  };

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findByIds: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  const mockStoreManagerStoreRepository = {
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockBookstoreRepository = {
    findByIds: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(StoreManagerStoreEntity),
          useValue: mockStoreManagerStoreRepository,
        },
        {
          provide: getRepositoryToken(BookstoreEntity),
          useValue: mockBookstoreRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
    storeManagerStoreRepository = module.get<Repository<StoreManagerStoreEntity>>(
      getRepositoryToken(StoreManagerStoreEntity),
    );
    bookstoreRepository = module.get<Repository<BookstoreEntity>>(
      getRepositoryToken(BookstoreEntity),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    const createUserDto = {
      email: 'test@example.com',
      password: 'password123',
      role: Role.USER,
    };

    it('should create a new user successfully', async () => {
      const hashedPassword = 'hashedPassword';
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue({ ...createUserDto, password: hashedPassword });
      mockUserRepository.save.mockResolvedValue({ id: 1, ...createUserDto, password: hashedPassword });

      const result = await service.createUser(createUserDto);

      expect(result).toBeDefined();
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if user email already exists', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 1, ...createUserDto });

      await expect(service.createUser(createUserDto)).rejects.toThrow(ConflictException);
    });

    it('should create store manager with store relationships', async () => {
      const storeManagerDto = {
        ...createUserDto,
        role: Role.STORE_MANAGER,
        storeIds: [1, 2],
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockBookstoreRepository.findByIds.mockResolvedValue([
        { id: 1 },
        { id: 2 },
      ]);
      mockUserRepository.create.mockReturnValue({ id: 1, ...storeManagerDto });
      mockUserRepository.save.mockResolvedValue({ id: 1, ...storeManagerDto });

      await service.createUser(storeManagerDto);

      expect(mockBookstoreRepository.findByIds).toHaveBeenCalledWith(storeManagerDto.storeIds);
      expect(mockStoreManagerStoreRepository.save).toHaveBeenCalled();
    });
  });

  describe('updateUser', () => {
    const userId = 1;
    const updateUserDto = {
      role: Role.STORE_MANAGER,
      storeIds: [1, 2],
    };

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.updateUser(userId, updateUserDto)).rejects.toThrow(NotFoundException);
    });

    it('should update user role and store relationships', async () => {
      const existingUser = {
        id: userId,
        role: Role.USER,
        storeManagerStores: [],
      };

      mockUserRepository.findOne.mockResolvedValue(existingUser);
      mockBookstoreRepository.findByIds.mockResolvedValue([
        { id: 1 },
        { id: 2 },
      ]);
      mockUserRepository.save.mockResolvedValue({ ...existingUser, role: Role.STORE_MANAGER });

      await service.updateUser(userId, updateUserDto);

      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(mockStoreManagerStoreRepository.save).toHaveBeenCalled();
    });
  });

  describe('getUsers', () => {
    const queryParams = {
      page: 1,
      limit: 10,
      search: '',
      role: Role.USER,
      sortBy: UsersSortBy.EMAIL,
      order: OrderDirection.ASC,
    };

    it('should return paginated users', async () => {
      const users = [{ id: 1, email: 'test@example.com' }];
      const total = 1;

      mockQueryBuilder.getManyAndCount.mockResolvedValue([users, total]);

      const result = await service.getUsers(queryParams);

      expect(result.data).toEqual(users);
      expect(result.meta.total).toEqual(total);
      expect(result.meta.page).toEqual(queryParams.page);
      expect(result.meta.limit).toEqual(queryParams.limit);
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const email = 'test@example.com';
      const user = { id: 1, email };

      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.findByEmail(email);

      expect(result).toEqual(user);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
    });
  });
});
