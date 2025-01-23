import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { GetBooksDto, BooksSortBy } from './dto/get-books.dto';
import { BookEntity } from './entities/book.entity/book.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, ILike } from 'typeorm';
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface';

@Injectable()
export class BooksService {
    private readonly logger = new Logger(BooksService.name);

    constructor(
        @InjectRepository(BookEntity)
        private readonly bookRepository: Repository<BookEntity>
    ) {}

    async getBooks(query: GetBooksDto): Promise<PaginatedResponse<BookEntity>> {
        this.logger.log(`Fetching books with query: ${JSON.stringify(query)}`);
        const { page, limit, search, sortBy, order } = query;
        const skip = (page - 1) * limit;

        const queryBuilder = this.bookRepository.createQueryBuilder('book');

        if (search) {
            this.logger.debug(`Applying search filter: ${search}`);
            queryBuilder.where([
                { title: ILike(`%${search}%`) },
                { author: ILike(`%${search}%`) }
            ]);
        }

        switch (sortBy) {
            case BooksSortBy.TITLE:
                queryBuilder.orderBy('book.title', order);
                break;
            case BooksSortBy.AUTHOR:
                queryBuilder.orderBy('book.author', order);
                break;
            case BooksSortBy.PRICE:
                queryBuilder.orderBy('book.price', order);
                break;
            case BooksSortBy.CREATED_AT:
                queryBuilder.orderBy('book.createdAt', order);
                break;
            case BooksSortBy.UPDATED_AT:
                queryBuilder.orderBy('book.updatedAt', order);
                break;
        }

        const [books, total] = await queryBuilder
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        this.logger.debug(`Found ${total} books in total`);
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

    async createBook(createBookDto: CreateBookDto): Promise<BookEntity> {
        this.logger.log(`Creating new book: ${createBookDto.title} by ${createBookDto.author}`);
        
        // Check if book with same title and author exists
        const existingBookByTitleAndAuthor = await this.bookRepository.findOne({
            where: {
                title: createBookDto.title,
                author: createBookDto.author
            }
        });

        if (existingBookByTitleAndAuthor) {
            this.logger.warn(`Duplicate book creation attempt: ${createBookDto.title} by ${createBookDto.author}`);
            throw new ConflictException('A book with this title and author already exists');
        }

        const book = this.bookRepository.create(createBookDto);
        const savedBook = await this.bookRepository.save(book);
        this.logger.log(`Successfully created book with ID: ${savedBook.id}`);
        return savedBook;
    }

    async updateBook(id: number, updateBookDto: UpdateBookDto): Promise<BookEntity> {
        this.logger.log(`Updating book with ID: ${id}`);
        
        const book = await this.bookRepository.findOne({ where: { id } });
        if (!book) {
            this.logger.warn(`Update attempt for non-existent book with ID: ${id}`);
            throw new NotFoundException(`Book with ID "${id}" not found`);
        }

        // If updating title and author, check for duplicates
        if (updateBookDto.title && updateBookDto.author) {
            this.logger.debug(`Checking for duplicates with title: ${updateBookDto.title} and author: ${updateBookDto.author}`);
            const existingBook = await this.bookRepository.findOne({
                where: {
                    title: updateBookDto.title,
                    author: updateBookDto.author,
                    id: Not(id)
                }
            });

            if (existingBook) {
                this.logger.warn(`Duplicate book update attempt for ID: ${id}`);
                throw new ConflictException('A book with this title and author already exists');
            }
        }

        // Update the book with the new values
        Object.assign(book, updateBookDto);
        const updatedBook = await this.bookRepository.save(book);
        this.logger.log(`Successfully updated book with ID: ${id}`);
        return updatedBook;
    }
}
