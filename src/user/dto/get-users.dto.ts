import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Role } from 'src/common/constants/role.enum';

export enum UsersSortBy {
  EMAIL = 'email',
  ROLE = 'role',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export class GetUsersDto extends PaginationDto {
  @ApiProperty({
    description: 'Search term to filter users by email',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filter users by role',
    enum: Role,
    required: false,
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiProperty({
    description: 'Field to sort the users by',
    enum: UsersSortBy,
    required: false,
    default: UsersSortBy.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(UsersSortBy)
  sortBy?: UsersSortBy = UsersSortBy.CREATED_AT;
} 