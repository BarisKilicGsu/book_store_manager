import { Test, TestingModule } from '@nestjs/testing';
import { BooksService } from './books.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BookEntity } from './entities/book.entity/book.entity';
import { Repository, Not, ILike } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { BooksSortBy } from './dto/get-books.dto';
import { OrderDirection } from '../common/dto/pagination.dto';

describe('BooksService', () => {
  let service: BooksService;
  let bookRepository: Repository<BookEntity>;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  };

  const mockBookRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: getRepositoryToken(BookEntity),
          useValue: mockBookRepository,
        },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
    bookRepository = module.get<Repository<BookEntity>>(getRepositoryToken(BookEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createBook', () => {
    const createBookDto = {
      title: 'Test Book',
      author: 'Test Author',
      price: 29.99,
      description: 'Test Description',
    };

    it('should create a new book successfully', async () => {
      mockBookRepository.findOne.mockResolvedValue(null);
      mockBookRepository.create.mockReturnValue(createBookDto);
      mockBookRepository.save.mockResolvedValue({ id: 1, ...createBookDto });

      const result = await service.createBook(createBookDto);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(mockBookRepository.findOne).toHaveBeenCalledWith({
        where: {
          title: createBookDto.title,
          author: createBookDto.author,
        },
      });
      expect(mockBookRepository.create).toHaveBeenCalledWith(createBookDto);
      expect(mockBookRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if book with same title and author exists', async () => {
      mockBookRepository.findOne.mockResolvedValue({ id: 1, ...createBookDto });

      await expect(service.createBook(createBookDto)).rejects.toThrow(ConflictException);
      expect(mockBookRepository.findOne).toHaveBeenCalledWith({
        where: {
          title: createBookDto.title,
          author: createBookDto.author,
        },
      });
    });
  });

  describe('updateBook', () => {
    const bookId = 1;
    const updateBookDto = {
      title: 'Updated Book',
      author: 'Updated Author',
      price: 39.99,
    };

    it('should throw NotFoundException if book not found', async () => {
      mockBookRepository.findOne.mockResolvedValue(null);

      await expect(service.updateBook(bookId, updateBookDto)).rejects.toThrow(NotFoundException);
      expect(mockBookRepository.findOne).toHaveBeenCalledWith({ where: { id: bookId } });
    });

    it('should update book successfully', async () => {
      const existingBook = {
        id: bookId,
        title: 'Old Title',
        author: 'Old Author',
        price: 29.99,
      };

      mockBookRepository.findOne
        .mockResolvedValueOnce(existingBook)  // First call for finding the book
        .mockResolvedValueOnce(null);         // Second call for duplicate check

      const updatedBook = { ...existingBook, ...updateBookDto };
      mockBookRepository.save.mockResolvedValue(updatedBook);

      const result = await service.updateBook(bookId, updateBookDto);

      expect(result).toEqual(updatedBook);
      expect(mockBookRepository.save).toHaveBeenCalledWith(updatedBook);
    });

    it('should throw ConflictException if updating to existing title and author combination', async () => {
      const existingBook = {
        id: bookId,
        title: 'Old Title',
        author: 'Old Author',
        price: 29.99,
      };

      mockBookRepository.findOne
        .mockResolvedValueOnce(existingBook)  // First call for finding the book
        .mockResolvedValueOnce({ id: 2, ...updateBookDto });  // Second call finds duplicate

      await expect(service.updateBook(bookId, updateBookDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('getBooks', () => {
    const queryParams = {
      page: 1,
      limit: 10,
      search: 'test',
      sortBy: BooksSortBy.TITLE,
      order: OrderDirection.ASC,
    };

    it('should return paginated books', async () => {
      const books = [
        { id: 1, title: 'Test Book 1', author: 'Author 1' },
        { id: 2, title: 'Test Book 2', author: 'Author 2' },
      ];
      const total = 2;

      mockQueryBuilder.getManyAndCount.mockResolvedValue([books, total]);

      const result = await service.getBooks(queryParams);

      expect(result.data).toEqual(books);
      expect(result.meta.total).toEqual(total);
      expect(result.meta.page).toEqual(queryParams.page);
      expect(result.meta.limit).toEqual(queryParams.limit);
      expect(result.meta.totalPages).toEqual(Math.ceil(total / queryParams.limit));
    });

    it('should apply search filter when search parameter is provided', async () => {
      const books = [{ id: 1, title: 'Test Book', author: 'Test Author' }];
      const total = 1;

      mockQueryBuilder.getManyAndCount.mockResolvedValue([books, total]);

      await service.getBooks(queryParams);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith([
        { title: ILike(`%${queryParams.search}%`) },
        { author: ILike(`%${queryParams.search}%`) },
      ]);
    });
  });
});
