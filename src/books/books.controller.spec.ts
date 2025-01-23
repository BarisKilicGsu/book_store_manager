import { Test, TestingModule } from '@nestjs/testing';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { GetBooksDto } from './dto/get-books.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CacheService } from '../common/cache/cache.service';

jest.mock('../auth/guards/jwt-auth.guard');
jest.mock('../auth/guards/roles.guard');

describe('BooksController', () => {
  let controller: BooksController;
  let booksService: BooksService;

  const mockBooksService = {
    getBooks: jest.fn(),
    createBook: jest.fn(),
    updateBook: jest.fn(),
  };

  const mockCacheService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [
        {
          provide: BooksService,
          useValue: mockBooksService,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    controller = module.get<BooksController>(BooksController);
    booksService = module.get<BooksService>(BooksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getBooks', () => {
    const getBooksDto: GetBooksDto = {
      page: 1,
      limit: 10,
      search: 'test',
    };

    const mockBooks = {
      data: [
        {
          id: 1,
          title: 'Test Book',
          author: 'Test Author',
          price: 29.99,
        },
      ],
      meta: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    };

    it('should return paginated books', async () => {
      mockBooksService.getBooks.mockResolvedValue(mockBooks);

      const result = await controller.getBooks(getBooksDto);

      expect(result).toEqual(mockBooks);
      expect(mockBooksService.getBooks).toHaveBeenCalledWith(getBooksDto);
    });
  });

  describe('createBook', () => {
    const createBookDto: CreateBookDto = {
      title: 'Test Book',
      author: 'Test Author',
      price: 29.99,
      description: 'Test Description',
    };

    const mockBook = {
      id: 1,
      ...createBookDto,
    };

    it('should create a new book', async () => {
      mockBooksService.createBook.mockResolvedValue(mockBook);

      const result = await controller.createBook(createBookDto);

      expect(result).toEqual(mockBook);
      expect(mockBooksService.createBook).toHaveBeenCalledWith(createBookDto);
    });
  });

  describe('updateBook', () => {
    const bookId = 1;
    const updateBookDto: UpdateBookDto = {
      title: 'Updated Book',
      price: 39.99,
    };

    const mockBook = {
      id: bookId,
      title: 'Updated Book',
      author: 'Test Author',
      price: 39.99,
    };

    it('should update book', async () => {
      mockBooksService.updateBook.mockResolvedValue(mockBook);

      const result = await controller.updateBook(bookId, updateBookDto);

      expect(result).toEqual(mockBook);
      expect(mockBooksService.updateBook).toHaveBeenCalledWith(bookId, updateBookDto);
    });
  });
});
