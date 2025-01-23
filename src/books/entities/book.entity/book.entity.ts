import { BaseEntity } from "src/common/entities/base.entity";
import { Column, Entity, OneToMany } from "typeorm";
import { BookstoreBookEntity } from "src/stores/entities/bookstore-book.entity/bookstore-book.entity";

@Entity()
export class BookEntity extends BaseEntity {
    @Column()
    title: string;
  
    @Column()
    author: string; 

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @Column({ nullable: true })
    description: string;

    @OneToMany(() => BookstoreBookEntity, (bookstoreBook) => bookstoreBook.book)
    bookstoreBooks: BookstoreBookEntity[];
}
