import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export enum BooksSortBy {
  TITLE = 'title',
  AUTHOR = 'author',
  PRICE = 'price',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export class GetBooksDto extends PaginationDto {
  @ApiProperty({
    description: 'Search term to filter books by title or author',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Field to sort the books by',
    enum: BooksSortBy,
    required: false,
    default: BooksSortBy.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(BooksSortBy)
  sortBy?: BooksSortBy = BooksSortBy.CREATED_AT;
} 