import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { UserEntity } from './entities/user.entity/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUsersDto, UsersSortBy } from './dto/get-users.dto';
import { Role } from 'src/common/constants/role.enum';
import { StoreManagerStoreEntity } from 'src/stores/entities/store-manager-store.entity/store-manager-store.entity';
import { BookstoreEntity } from 'src/stores/entities/bookstore.entity/bookstore.entity';
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);

    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(StoreManagerStoreEntity)
        private readonly storeManagerStoreRepository: Repository<StoreManagerStoreEntity>,
        @InjectRepository(BookstoreEntity)
        private readonly bookstoreRepository: Repository<BookstoreEntity>,
    ) {}

    async getUsers(query: GetUsersDto): Promise<PaginatedResponse<UserEntity>> {
        this.logger.log(`Fetching users with query: ${JSON.stringify(query)}`);
        const { page, limit, search, role, sortBy, order } = query;
        const skip = (page - 1) * limit;

        const queryBuilder = this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.storeManagerStores', 'storeManagerStores')
            .leftJoinAndSelect('storeManagerStores.bookstore', 'bookstore');

        // Apply search filter
        if (search) {
            this.logger.debug(`Applying search filter: ${search}`);
            queryBuilder.andWhere('user.email ILIKE :search', { search: `%${search}%` });
        }

        // Apply role filter
        if (role) {
            this.logger.debug(`Filtering by role: ${role}`);
            queryBuilder.andWhere('user.role = :role', { role });
        }

        // Apply sorting
        switch (sortBy) {
            case UsersSortBy.EMAIL:
                queryBuilder.orderBy('user.email', order);
                break;
            case UsersSortBy.ROLE:
                queryBuilder.orderBy('user.role', order);
                break;
            case UsersSortBy.CREATED_AT:
                queryBuilder.orderBy('user.createdAt', order);
                break;
            case UsersSortBy.UPDATED_AT:
                queryBuilder.orderBy('user.updatedAt', order);
                break;
        }

        const [users, total] = await queryBuilder
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        this.logger.debug(`Found ${total} users in total`);
        return {
            data: users,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
        this.logger.log(`Creating new user with email: ${createUserDto.email}`);

        const existingUser = await this.userRepository.findOne({
            where: { email: createUserDto.email }
        });

        if (existingUser) {
            this.logger.warn(`Attempt to create duplicate user: ${createUserDto.email}`);
            throw new ConflictException('User with this email already exists');
        }

        // If role is STORE_MANAGER and storeIds provided, validate them
        if (createUserDto.role === Role.STORE_MANAGER && createUserDto.storeIds?.length) {
            this.logger.debug(`Validating store IDs for store manager: ${createUserDto.storeIds.join(', ')}`);
            // Verify all stores exist
            const stores = await this.bookstoreRepository.findByIds(createUserDto.storeIds);
            if (stores.length !== createUserDto.storeIds.length) {
                this.logger.warn(`Invalid store IDs provided for user: ${createUserDto.email}`);
                throw new BadRequestException('One or more store IDs are invalid');
            }
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

        // Create user
        const user = this.userRepository.create({
            ...createUserDto,
            password: hashedPassword
        });
        
        // Save user first to ensure we have an ID
        await this.userRepository.save(user);

        // If STORE_MANAGER and storeIds provided, create store relationships
        if (createUserDto.role === Role.STORE_MANAGER && createUserDto.storeIds?.length) {
            this.logger.debug(`Creating store manager relationships for user: ${user.id}`);
            const storeManagerStores = createUserDto.storeIds.map(storeId => {
                const sms = new StoreManagerStoreEntity();
                sms.user = user;
                sms.bookstore = { id: storeId } as BookstoreEntity;
                return sms;
            });
            await this.storeManagerStoreRepository.save(storeManagerStores);
        }

        this.logger.log(`Successfully created user with ID: ${user.id}`);
        return this.userRepository.findOne({ 
            where: { id: user.id },
            relations: ['storeManagerStores', 'storeManagerStores.bookstore']
        });
    }

    async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<UserEntity> {
        this.logger.log(`Updating user with ID: ${id}`);

        const user = await this.userRepository.findOne({ 
            where: { id },
            relations: ['storeManagerStores']
        });

        if (!user) {
            this.logger.warn(`Update attempt for non-existent user with ID: ${id}`);
            throw new NotFoundException('User not found');
        }

        // If changing role to STORE_MANAGER and storeIds provided, validate them
        if (updateUserDto.role === Role.STORE_MANAGER && updateUserDto.storeIds?.length) {
            this.logger.debug(`Validating store IDs for store manager update: ${updateUserDto.storeIds.join(', ')}`);
            // Verify all stores exist
            const stores = await this.bookstoreRepository.findByIds(updateUserDto.storeIds);
            if (stores.length !== updateUserDto.storeIds.length) {
                this.logger.warn(`Invalid store IDs provided for user update: ${id}`);
                throw new BadRequestException('One or more store IDs are invalid');
            }
        }

        // Update user role
        if (updateUserDto.role) {
            this.logger.debug(`Updating user role from ${user.role} to ${updateUserDto.role}`);
            user.role = updateUserDto.role;
        }

        // Save user first to ensure we have an ID
        await this.userRepository.save(user);

        // Handle store manager relationships
        if (user.role === Role.STORE_MANAGER) {
            // Remove existing relationships if any
            // Get existing store IDs
            const existingStoreIds = user.storeManagerStores?.map(sms => sms.bookstore?.id) || [];
            const newStoreIds = updateUserDto.storeIds || [];

            // Find store IDs to remove and add
            const storeIdsToRemove = existingStoreIds.filter(id => !newStoreIds.includes(id));
            const storeIdsToAdd = newStoreIds.filter(id => !existingStoreIds.includes(id));

            // Remove relationships that are no longer needed
            if (storeIdsToRemove.length) {
                this.logger.debug(`Removing store relationships: ${storeIdsToRemove.join(', ')}`);
                const relationshipsToRemove = user.storeManagerStores.filter(sms => 
                    storeIdsToRemove.includes(sms.bookstore?.id)
                );
                await this.storeManagerStoreRepository.remove(relationshipsToRemove);
            }

            // Add new relationships
            if (storeIdsToAdd.length) {
                this.logger.debug(`Adding new store relationships: ${storeIdsToAdd.join(', ')}`);
                const newStoreManagerStores = storeIdsToAdd.map(storeId => {
                    const sms = new StoreManagerStoreEntity();
                    sms.user = user;
                    sms.bookstore = { id: storeId } as BookstoreEntity;
                    return sms;
                });
                await this.storeManagerStoreRepository.save(newStoreManagerStores);
            }
        } else {
            // If role is USER, remove all store relationships
            if (user.storeManagerStores?.length) {
                this.logger.debug(`Removing all store relationships for user: ${id}`);
                await this.storeManagerStoreRepository.remove(user.storeManagerStores);
            }
        }

        this.logger.log(`Successfully updated user with ID: ${id}`);
        return this.userRepository.findOne({ 
            where: { id },
            relations: ['storeManagerStores', 'storeManagerStores.bookstore']
        });
    }

    async findByEmail(email: string) : Promise<UserEntity> {
        this.logger.debug(`Finding user by email: ${email}`);
        return this.userRepository.findOne({ where: { email } });
    }
}
