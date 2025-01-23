import { BaseEntity } from "src/common/entities/base.entity";
import { UserEntity } from "src/user/entities/user.entity/user.entity";
import { ManyToOne } from "typeorm";
import { BookstoreEntity } from "../bookstore.entity/bookstore.entity";
import { Entity } from "typeorm";

@Entity()
export class StoreManagerStoreEntity extends BaseEntity {

    @ManyToOne(() => UserEntity, (user) => user.storeManagerStores, {
        onDelete: 'CASCADE',
    })
    user: UserEntity;

    @ManyToOne(() => BookstoreEntity, (bookstore) => bookstore.storeManagerStores, {
        onDelete: 'CASCADE',
    })
    bookstore: BookstoreEntity;
}
