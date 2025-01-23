import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { BookstoreEntity } from './entities/bookstore.entity/bookstore.entity';
import { GetStoresDto, StoresSortBy } from './dto/get-stores.dto';
import { BookstoreBookEntity } from './entities/bookstore-book.entity/bookstore-book.entity';
import { GetStoreBooksDto, StoreBooksSortBy } from './dto/get-store-books.dto';
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface';
import { OrderDirection } from 'src/common/dto/pagination.dto';
import { UpdateStoreBookQuantityDto } from './dto/update-store-book-quantity.dto';
import { CreateStoreDto } from './dto/create-stores.dto';

@Injectable()
export class StoresService {
  private readonly logger = new Logger(StoresService.name);

  constructor(
    @InjectRepository(BookstoreEntity)
    private readonly bookstoreRepository: Repository<BookstoreEntity>,
    @InjectRepository(BookstoreBookEntity)
    private readonly bookstoreBookRepository: Repository<BookstoreBookEntity>,
  ) {}

  async getStores(query: GetStoresDto): Promise<PaginatedResponse<BookstoreEntity>> {
    this.logger.log(`Fetching stores with query: ${JSON.stringify(query)}`);
    const { page, limit, search, sortBy, order } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.bookstoreRepository.createQueryBuilder('store');

    if (search) {
      this.logger.debug(`Applying search filter: ${search}`);
      queryBuilder.where({ name: ILike(`%${search}%`) });
    }

    switch (sortBy) {
      case StoresSortBy.NAME:
        queryBuilder.orderBy('store.name', order);
        break;
      case StoresSortBy.CREATED_AT:
        queryBuilder.orderBy('store.createdAt', order);
        break;
      case StoresSortBy.UPDATED_AT:
        queryBuilder.orderBy('store.updatedAt', order);
        break;
    }

    const [stores, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    this.logger.debug(`Found ${total} stores in total`);
    return {
      data: stores,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getStoreBooks(storeId: number, query: GetStoreBooksDto): Promise<PaginatedResponse<BookstoreBookEntity>> {
    this.logger.log(`Fetching books for store ID: ${storeId} with query: ${JSON.stringify(query)}`);
    
    const store = await this.bookstoreRepository.findOne({ where: { id: storeId } });
    if (!store) {
      this.logger.warn(`Store not found with ID: ${storeId}`);
      throw new NotFoundException(`Bookstore with ID "${storeId}" not found`);
    }

    const { page, limit, search, sortBy, order, minQuantity } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.bookstoreBookRepository
      .createQueryBuilder('bookstore_book')
      .leftJoinAndSelect('bookstore_book.book', 'book')
      .where('bookstore_book.bookstore = :storeId', { storeId });

    if (search) {
      this.logger.debug(`Applying search filter: ${search}`);
      queryBuilder.andWhere('book.title ILIKE :search', { search: `%${search}%` });
    }

    if (minQuantity !== undefined) {
      this.logger.debug(`Filtering by minimum quantity: ${minQuantity}`);
      queryBuilder.andWhere('bookstore_book.quantity >= :minQuantity', { minQuantity });
    }

    switch (sortBy) {
      case StoreBooksSortBy.BOOK_TITLE:
        queryBuilder.orderBy('book.title', order);
        break;
      case StoreBooksSortBy.QUANTITY:
        queryBuilder.orderBy('bookstore_book.quantity', order);
        break;
      case StoreBooksSortBy.CREATED_AT:
        queryBuilder.orderBy('bookstore_book.createdAt', order);
        break;
      case StoreBooksSortBy.UPDATED_AT:
        queryBuilder.orderBy('bookstore_book.updatedAt', order);
        break;
    }

    const [books, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    this.logger.debug(`Found ${total} books in store ${storeId}`);
    return {
      data: books,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async searchBooksInStores(query: GetStoreBooksDto): Promise<PaginatedResponse<BookstoreBookEntity>> {
    this.logger.log(`Searching books across all stores with query: ${JSON.stringify(query)}`);
    const { page, limit, search, sortBy, order, minQuantity } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.bookstoreBookRepository
      .createQueryBuilder('bookstore_book')
      .leftJoinAndSelect('bookstore_book.book', 'book')
      .leftJoinAndSelect('bookstore_book.bookstore', 'bookstore');

    if (search) {
      this.logger.debug(`Applying search filter: ${search}`);
      queryBuilder.andWhere('book.title ILIKE :search', { search: `%${search}%` });
    }

    if (minQuantity !== undefined) {
      this.logger.debug(`Filtering by minimum quantity: ${minQuantity}`);
      queryBuilder.andWhere('bookstore_book.quantity >= :minQuantity', { minQuantity });
    }

    switch (sortBy) {
      case StoreBooksSortBy.BOOK_TITLE:
        queryBuilder.orderBy('book.title', order);
        break;
      case StoreBooksSortBy.QUANTITY:
        queryBuilder.orderBy('bookstore_book.quantity', order);
        break;
      case StoreBooksSortBy.CREATED_AT:
        queryBuilder.orderBy('bookstore_book.createdAt', order);
        break;
      case StoreBooksSortBy.UPDATED_AT:
        queryBuilder.orderBy('bookstore_book.updatedAt', order);
        break;
    }

    const [books, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    this.logger.debug(`Found ${total} books across all stores`);
    return {
      data: books,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateBookQuantity(
    storeId: number,
    bookId: number,
    updateQuantityDto: UpdateStoreBookQuantityDto,
  ): Promise<BookstoreBookEntity> {
    this.logger.log(`Updating book quantity - Store: ${storeId}, Book: ${bookId}, Change: ${updateQuantityDto.quantity}`);
    
    const store = await this.bookstoreRepository.findOne({ where: { id: storeId } });
    if (!store) {
      this.logger.warn(`Store not found with ID: ${storeId}`);
      throw new NotFoundException(`Bookstore with ID "${storeId}" not found`);
    }

    let bookstoreBook = await this.bookstoreBookRepository.findOne({
      where: {
        bookstore: { id: storeId },
        book: { id: bookId },
      },
      relations: ['book'],
    });

    if (!bookstoreBook) {
      this.logger.debug(`Creating new book entry in store ${storeId} for book ${bookId}`);
      bookstoreBook = this.bookstoreBookRepository.create({
        bookstore: store,
        book: { id: bookId },
        quantity: 0,
      });
    }

    const newQuantity = bookstoreBook.quantity + updateQuantityDto.quantity;
    if (newQuantity < 0) {
      this.logger.warn(`Invalid quantity update attempt - Current: ${bookstoreBook.quantity}, Change: ${updateQuantityDto.quantity}`);
      throw new BadRequestException('Cannot reduce quantity below 0');
    }

    bookstoreBook.quantity = newQuantity;
    const updatedBook = await this.bookstoreBookRepository.save(bookstoreBook);
    this.logger.log(`Successfully updated book quantity - New quantity: ${newQuantity}`);
    return updatedBook;
  }

  async createStore(createStoreDto: CreateStoreDto): Promise<BookstoreEntity> {
    this.logger.log(`Creating new store: ${createStoreDto.name}`);
    
    // Check if store with same name already exists
    const existingStore = await this.bookstoreRepository.findOne({
      where: { name: createStoreDto.name },
    });

    if (existingStore) {
      this.logger.warn(`Attempt to create duplicate store: ${createStoreDto.name}`);
      throw new ConflictException(`Bookstore with name "${createStoreDto.name}" already exists`);
    }

    const store = this.bookstoreRepository.create(createStoreDto);
    const savedStore = await this.bookstoreRepository.save(store);
    this.logger.log(`Successfully created store with ID: ${savedStore.id}`);
    return savedStore;
  }
}
