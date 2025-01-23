import { BookEntity } from "src/books/entities/book.entity/book.entity";
import { BaseEntity } from "src/common/entities/base.entity";
import { ManyToOne } from "typeorm";
import { Column } from "typeorm";
import { BookstoreEntity } from "../bookstore.entity/bookstore.entity";
import { Entity } from "typeorm";

@Entity()
export class BookstoreBookEntity  extends BaseEntity {

    @ManyToOne(() => BookstoreEntity, (bookstore) => bookstore.bookstoreBooks, {
    onDelete: 'CASCADE',
    })
    bookstore: BookstoreEntity  ;
        
    @ManyToOne(() => BookEntity, (book) => book.bookstoreBooks, {
    onDelete: 'CASCADE',
    })
    book: BookEntity;

    @Column({ default: 0 })
    quantity: number;

}
