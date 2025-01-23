import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../../user/entities/user.entity/user.entity';
import { SeedService } from './seed.service';
import { BookEntity } from '../../books/entities/book.entity/book.entity';
import { BookstoreEntity } from '../../stores/entities/bookstore.entity/bookstore.entity';
import { BookstoreBookEntity } from '../../stores/entities/bookstore-book.entity/bookstore-book.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, BookEntity, BookstoreEntity, BookstoreBookEntity]),
  ],
  providers: [SeedService],
})
export class SeedModule {} 