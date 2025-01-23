import { BaseEntity } from "src/common/entities/base.entity";
import { Column, Entity, OneToMany } from "typeorm";
import { BookstoreBookEntity } from "src/stores/entities/bookstore-book.entity/bookstore-book.entity";
import { StoreManagerStoreEntity } from "src/stores/entities/store-manager-store.entity/store-manager-store.entity";

@Entity()
export class BookstoreEntity  extends BaseEntity {

  @Column()
  name: string;

  @Column()
  address: string;

  @Column({ nullable: true })
  phone: string;

  @OneToMany(() => BookstoreBookEntity, (bookstoreBook) => bookstoreBook.bookstore)
  bookstoreBooks: BookstoreBookEntity[];

  @OneToMany(() => StoreManagerStoreEntity, (sms) => sms.bookstore)
  storeManagerStores: StoreManagerStoreEntity[];

}
