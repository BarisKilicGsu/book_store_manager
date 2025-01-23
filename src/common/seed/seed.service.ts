/**
 * Service for seeding initial data into the database on application startup
 * Creates default admin user, sample books, bookstores, and their inventory
 */
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity/user.entity';
import { Role } from '../constants/role.enum';
import { hash } from 'bcrypt';
import { BookEntity } from '../../books/entities/book.entity/book.entity';
import { BookstoreEntity } from '../../stores/entities/bookstore.entity/bookstore.entity';
import { BookstoreBookEntity } from '../../stores/entities/bookstore-book.entity/bookstore-book.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(BookEntity)
    private readonly bookRepository: Repository<BookEntity>,
    @InjectRepository(BookstoreEntity)
    private readonly bookstoreRepository: Repository<BookstoreEntity>,
    @InjectRepository(BookstoreBookEntity)
    private readonly bookstoreBookRepository: Repository<BookstoreBookEntity>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedAdminUser();
    await this.seedBooks();
    await this.seedBookstores();
    await this.seedBookstoreBooks();
  }

  private async seedAdminUser() {
    const adminExists = await this.userRepository.findOne({
      where: { email: 'admin@bookmanager.com' }
    });

    if (!adminExists) {
      const hashedPassword = await hash('admin123', 10);
      
      const admin = this.userRepository.create({
        email: 'admin@bookmanager.com',
        password: hashedPassword,
        role: Role.ADMIN
      });

      await this.userRepository.save(admin);
      console.log('Admin user seeded successfully');
    }
  }

  private async seedBooks() {
    const existingBooks = await this.bookRepository.find();
    if (existingBooks.length === 0) {
      const books = [
        {
          title: '1984',
          author: 'George Orwell',
          price: 19.99,
          description: 'A dystopian novel by English novelist George Orwell',
        },
        {
          title: 'To Kill a Mockingbird',
          author: 'Harper Lee',
          price: 15.99,
          description: 'A novel about racial injustice in the American South',
        },
        {
          title: 'The Great Gatsby',
          author: 'F. Scott Fitzgerald',
          price: 12.99,
          description: 'A story of decadence and excess',
        },
        {
          title: 'Pride and Prejudice',
          author: 'Jane Austen',
          price: 9.99,
          description: 'A romantic novel of manners',
        },
        {
          title: 'The Hobbit',
          author: 'J.R.R. Tolkien',
          price: 24.99,
          description: 'A fantasy novel about the adventures of Bilbo Baggins',
        },
      ];

      for (const bookData of books) {
        const book = this.bookRepository.create(bookData);
        await this.bookRepository.save(book);
      }
      console.log('Sample books seeded successfully');
    }
  }

  private async seedBookstores() {
    const existingStores = await this.bookstoreRepository.find();
    if (existingStores.length === 0) {
      const stores = [
        {
          name: 'Downtown Books',
          address: '123 Main St, City Center',
          phone: '555-0123',
        },
        {
          name: 'Harbor Bookstore',
          address: '456 Beach Road, Harbor District',
          phone: '555-0456',
        },
        {
          name: 'University Books',
          address: '789 Campus Drive, University Area',
          phone: '555-0789',
        },
      ];

      for (const storeData of stores) {
        const store = this.bookstoreRepository.create(storeData);
        await this.bookstoreRepository.save(store);
      }
      console.log('Sample bookstores seeded successfully');
    }
  }

  private async seedBookstoreBooks() {
    const existingBookstoreBooks = await this.bookstoreBookRepository.find();
    if (existingBookstoreBooks.length === 0) {
      const books = await this.bookRepository.find();
      const stores = await this.bookstoreRepository.find();

      for (const store of stores) {
        for (const book of books) {
          const quantity = Math.floor(Math.random() * 20) + 1; // Random quantity between 1-20
          const bookstoreBook = this.bookstoreBookRepository.create({
            bookstore: store,
            book: book,
            quantity: quantity,
          });
          await this.bookstoreBookRepository.save(bookstoreBook);
        }
      }
      console.log('Sample bookstore books seeded successfully');
    }
  }
  
} 