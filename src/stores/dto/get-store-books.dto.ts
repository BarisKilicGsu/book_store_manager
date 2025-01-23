import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export enum StoreBooksSortBy {
  BOOK_TITLE = 'book.title',
  QUANTITY = 'quantity',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export class GetStoreBooksDto extends PaginationDto {
  @ApiPropertyOptional({ enum: StoreBooksSortBy, default: StoreBooksSortBy.CREATED_AT })
  @IsEnum(StoreBooksSortBy)
  @IsOptional()
  sortBy?: StoreBooksSortBy = StoreBooksSortBy.CREATED_AT;

  @ApiPropertyOptional({ minimum: 0 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  minQuantity?: number;
} 