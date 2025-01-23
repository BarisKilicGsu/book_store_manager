import { Test, TestingModule } from '@nestjs/testing';
import { StoresController } from './stores.controller';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-stores.dto';
import { GetStoresDto } from './dto/get-stores.dto';
import { GetStoreBooksDto } from './dto/get-store-books.dto';
import { UpdateStoreBookQuantityDto } from './dto/update-store-book-quantity.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CacheService } from '../common/cache/cache.service';

jest.mock('../auth/guards/jwt-auth.guard');
jest.mock('../auth/guards/roles.guard');

describe('StoresController', () => {
  let controller: StoresController;
  let storesService: StoresService;

  const mockStoresService = {
    getStores: jest.fn(),
    getStoreBooks: jest.fn(),
    searchBooksInStores: jest.fn(),
    updateBookQuantity: jest.fn(),
    createStore: jest.fn(),
  };

  const mockCacheService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoresController],
      providers: [
        {
          provide: StoresService,
          useValue: mockStoresService,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    controller = module.get<StoresController>(StoresController);
    storesService = module.get<StoresService>(StoresService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getStores', () => {
    const getStoresDto: GetStoresDto = {
      page: 1,
      limit: 10,
      search: 'test',
    };

    const mockStores = {
      data: [
        {
          id: 1,
          name: 'Test Store',
          address: 'Test Address',
        },
      ],
      meta: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    };

    it('should return paginated stores', async () => {
      mockStoresService.getStores.mockResolvedValue(mockStores);

      const result = await controller.getStores(getStoresDto);

      expect(result).toEqual(mockStores);
      expect(mockStoresService.getStores).toHaveBeenCalledWith(getStoresDto);
    });
  });

  describe('getStoreBooks', () => {
    const storeId = 1;
    const getStoreBooksDto: GetStoreBooksDto = {
      page: 1,
      limit: 10,
      search: 'test',
      minQuantity: 5,
    };

    const mockBooks = {
      data: [
        {
          id: 1,
          book: {
            id: 1,
            title: 'Test Book',
            author: 'Test Author',
          },
          quantity: 10,
        },
      ],
      meta: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    };

    it('should return paginated store books', async () => {
      mockStoresService.getStoreBooks.mockResolvedValue(mockBooks);

      const result = await controller.getStoreBooks(storeId, getStoreBooksDto);

      expect(result).toEqual(mockBooks);
      expect(mockStoresService.getStoreBooks).toHaveBeenCalledWith(storeId, getStoreBooksDto);
    });
  });

  describe('searchBooksInStores', () => {
    const getStoreBooksDto: GetStoreBooksDto = {
      page: 1,
      limit: 10,
      search: 'test',
      minQuantity: 5,
    };

    const mockBooks = {
      data: [
        {
          id: 1,
          book: {
            id: 1,
            title: 'Test Book',
            author: 'Test Author',
          },
          bookstore: {
            id: 1,
            name: 'Test Store',
          },
          quantity: 10,
        },
      ],
      meta: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    };

    it('should return paginated books across all stores', async () => {
      mockStoresService.searchBooksInStores.mockResolvedValue(mockBooks);

      const result = await controller.searchBooksInStores(getStoreBooksDto);

      expect(result).toEqual(mockBooks);
      expect(mockStoresService.searchBooksInStores).toHaveBeenCalledWith(getStoreBooksDto);
    });
  });

  describe('updateBookQuantity', () => {
    const storeId = 1;
    const bookId = 1;
    const updateQuantityDto: UpdateStoreBookQuantityDto = {
      quantity: 5,
    };

    const mockBookStore = {
      id: 1,
      book: {
        id: bookId,
        title: 'Test Book',
      },
      bookstore: {
        id: storeId,
        name: 'Test Store',
      },
      quantity: 15,
    };

    it('should update book quantity', async () => {
      mockStoresService.updateBookQuantity.mockResolvedValue(mockBookStore);

      const result = await controller.updateBookQuantity(storeId, bookId, updateQuantityDto);

      expect(result).toEqual(mockBookStore);
      expect(mockStoresService.updateBookQuantity).toHaveBeenCalledWith(storeId, bookId, updateQuantityDto);
    });
  });

  describe('createStore', () => {
    const createStoreDto: CreateStoreDto = {
      name: 'Test Store',
      address: 'Test Address',
    };

    const mockStore = {
      id: 1,
      ...createStoreDto,
    };

    it('should create a new store', async () => {
      mockStoresService.createStore.mockResolvedValue(mockStore);

      const result = await controller.createStore(createStoreDto);

      expect(result).toEqual(mockStore);
      expect(mockStoresService.createStore).toHaveBeenCalledWith(createStoreDto);
    });
  });
});
