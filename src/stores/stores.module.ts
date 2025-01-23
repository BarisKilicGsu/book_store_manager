import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoresController } from './stores.controller';
import { StoresService } from './stores.service';
import { BookstoreEntity } from './entities/bookstore.entity/bookstore.entity';
import { BookstoreBookEntity } from './entities/bookstore-book.entity/bookstore-book.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BookstoreEntity, BookstoreBookEntity])],
  controllers: [StoresController],
  providers: [StoresService],
  exports: [StoresService],
})
export class StoresModule {}
