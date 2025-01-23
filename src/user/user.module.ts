import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity/user.entity';
import { StoreManagerStoreEntity } from 'src/stores/entities/store-manager-store.entity/store-manager-store.entity';
import { BookstoreEntity } from 'src/stores/entities/bookstore.entity/bookstore.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      StoreManagerStoreEntity,
      BookstoreEntity
    ])
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
