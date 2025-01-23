import { Test, TestingModule } from '@nestjs/testing';
import { StoresService } from './stores.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BookstoreEntity } from './entities/bookstore.entity/bookstore.entity';
import { BookstoreBookEntity } from './entities/bookstore-book.entity/bookstore-book.entity';
import { Repository, ILike } from 'typeorm';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { StoresSortBy } from './dto/get-stores.dto';
import { StoreBooksSortBy } from './dto/get-store-books.dto';
import { OrderDirection } from '../common/dto/pagination.dto';

describe('StoresService', () => {
  let service: StoresService;
  let bookstoreRepository: Repository<BookstoreEntity>;
  let bookstoreBookRepository: Repository<BookstoreBookEntity>;

  const mockStoreQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  };

  const mockBookstoreBookQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  };

  const mockBookstoreRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(() => mockStoreQueryBuilder),
  };

  const mockBookstoreBookRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(() => mockBookstoreBookQueryBuilder),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoresService,
        {
          provide: getRepositoryToken(BookstoreEntity),
          useValue: mockBookstoreRepository,
        },
        {
          provide: getRepositoryToken(BookstoreBookEntity),
          useValue: mockBookstoreBookRepository,
        },
      ],
    }).compile();

    service = module.get<StoresService>(StoresService);
    bookstoreRepository = module.get<Repository<BookstoreEntity>>(getRepositoryToken(BookstoreEntity));
    bookstoreBookRepository = module.get<Repository<BookstoreBookEntity>>(getRepositoryToken(BookstoreBookEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createStore', () => {
    const createStoreDto = {
      name: 'Test Bookstore',
      address: 'Test Address',
    };

    it('should create a new store successfully', async () => {
      mockBookstoreRepository.findOne.mockResolvedValue(null);
      mockBookstoreRepository.create.mockReturnValue(createStoreDto);
      mockBookstoreRepository.save.mockResolvedValue({ id: 1, ...createStoreDto });

      const result = await service.createStore(createStoreDto);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(mockBookstoreRepository.findOne).toHaveBeenCalledWith({
        where: { name: createStoreDto.name },
      });
      expect(mockBookstoreRepository.create).toHaveBeenCalledWith(createStoreDto);
      expect(mockBookstoreRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if store with same name exists', async () => {
      mockBookstoreRepository.findOne.mockResolvedValue({ id: 1, ...createStoreDto });

      await expect(service.createStore(createStoreDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('getStores', () => {
    const queryParams = {
      page: 1,
      limit: 10,
      search: 'test',
      sortBy: StoresSortBy.NAME,
      order: OrderDirection.ASC,
    };

    it('should return paginated stores', async () => {
      const stores = [
        { id: 1, name: 'Test Store 1' },
        { id: 2, name: 'Test Store 2' },
      ];
      const total = 2;

      mockStoreQueryBuilder.getManyAndCount.mockResolvedValue([stores, total]);

      const result = await service.getStores(queryParams);

      expect(result.data).toEqual(stores);
      expect(result.meta.total).toEqual(total);
      expect(result.meta.page).toEqual(queryParams.page);
      expect(result.meta.limit).toEqual(queryParams.limit);
    });
  });

  describe('getStoreBooks', () => {
    const storeId = 1;
    const queryParams = {
      page: 1,
      limit: 10,
      search: 'test',
      sortBy: StoreBooksSortBy.BOOK_TITLE,
      order: OrderDirection.ASC,
      minQuantity: 5,
    };

    it('should throw NotFoundException if store not found', async () => {
      mockBookstoreRepository.findOne.mockResolvedValue(null);

      await expect(service.getStoreBooks(storeId, queryParams)).rejects.toThrow(NotFoundException);
    });

    it('should return paginated store books', async () => {
      const store = { id: storeId, name: 'Test Store' };
      const books = [
        { id: 1, book: { title: 'Book 1' }, quantity: 10 },
        { id: 2, book: { title: 'Book 2' }, quantity: 15 },
      ];
      const total = 2;

      mockBookstoreRepository.findOne.mockResolvedValue(store);
      mockBookstoreBookQueryBuilder.getManyAndCount.mockResolvedValue([books, total]);

      const result = await service.getStoreBooks(storeId, queryParams);

      expect(result.data).toEqual(books);
      expect(result.meta.total).toEqual(total);
    });
  });

  describe('updateBookQuantity', () => {
    const storeId = 1;
    const bookId = 1;
    const updateQuantityDto = { quantity: 5 };

    it('should throw NotFoundException if store not found', async () => {
      mockBookstoreRepository.findOne.mockResolvedValue(null);

      await expect(service.updateBookQuantity(storeId, bookId, updateQuantityDto)).rejects.toThrow(NotFoundException);
    });

    it('should create new book entry if not exists', async () => {
      const store = { id: storeId, name: 'Test Store' };
      mockBookstoreRepository.findOne.mockResolvedValue(store);
      mockBookstoreBookRepository.findOne.mockResolvedValue(null);
      
      const newBookEntry = {
        bookstore: store,
        book: { id: bookId },
        quantity: updateQuantityDto.quantity,
      };
      mockBookstoreBookRepository.create.mockReturnValue(newBookEntry);
      mockBookstoreBookRepository.save.mockResolvedValue({ id: 1, ...newBookEntry });

      const result = await service.updateBookQuantity(storeId, bookId, updateQuantityDto);

      expect(result).toBeDefined();
      expect(result.quantity).toEqual(updateQuantityDto.quantity);
    });

    it('should update existing book quantity', async () => {
      const store = { id: storeId, name: 'Test Store' };
      const existingBook = {
        id: 1,
        bookstore: store,
        book: { id: bookId },
        quantity: 10,
      };

      mockBookstoreRepository.findOne.mockResolvedValue(store);
      mockBookstoreBookRepository.findOne.mockResolvedValue(existingBook);
      
      const updatedBook = {
        ...existingBook,
        quantity: existingBook.quantity + updateQuantityDto.quantity,
      };
      mockBookstoreBookRepository.save.mockResolvedValue(updatedBook);

      const result = await service.updateBookQuantity(storeId, bookId, updateQuantityDto);

      expect(result.quantity).toEqual(updatedBook.quantity);
    });

    it('should throw BadRequestException when reducing quantity below 0', async () => {
      const store = { id: storeId, name: 'Test Store' };
      const existingBook = {
        id: 1,
        bookstore: store,
        book: { id: bookId },
        quantity: 5,
      };

      mockBookstoreRepository.findOne.mockResolvedValue(store);
      mockBookstoreBookRepository.findOne.mockResolvedValue(existingBook);

      await expect(
        service.updateBookQuantity(storeId, bookId, { quantity: -10 })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('searchBooksInStores', () => {
    const queryParams = {
      page: 1,
      limit: 10,
      search: 'test',
      sortBy: StoreBooksSortBy.BOOK_TITLE,
      order: OrderDirection.ASC,
      minQuantity: 5,
    };

    it('should return paginated books across all stores', async () => {
      const books = [
        { id: 1, book: { title: 'Book 1' }, bookstore: { name: 'Store 1' }, quantity: 10 },
        { id: 2, book: { title: 'Book 2' }, bookstore: { name: 'Store 2' }, quantity: 15 },
      ];
      const total = 2;

      mockBookstoreBookQueryBuilder.getManyAndCount.mockResolvedValue([books, total]);

      const result = await service.searchBooksInStores(queryParams);

      expect(result.data).toEqual(books);
      expect(result.meta.total).toEqual(total);
      expect(result.meta.page).toEqual(queryParams.page);
      expect(result.meta.limit).toEqual(queryParams.limit);
    });
  });
});
