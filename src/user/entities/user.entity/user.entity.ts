import { BaseEntity } from "src/common/entities/base.entity";
import { StoreManagerStoreEntity } from "src/stores/entities/store-manager-store.entity/store-manager-store.entity";
import { Column, Entity, OneToMany } from "typeorm";
import { Exclude } from "class-transformer";
import { Role } from "src/common/constants/role.enum";

@Entity()
export class UserEntity extends BaseEntity {
    @Column()
    @Exclude()
    password: string; 
  
    @Column({ unique: true })
    email: string;

    @Column({
        type: 'varchar',    
        enum: Role,
        default: Role.USER
    })
    role: string;
  
    @OneToMany(() => StoreManagerStoreEntity, (sms) => sms.user)
    storeManagerStores: StoreManagerStoreEntity[];          
}
