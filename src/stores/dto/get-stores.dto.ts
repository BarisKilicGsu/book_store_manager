import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export enum StoresSortBy {
  NAME = 'name',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export class GetStoresDto extends PaginationDto {
  @ApiPropertyOptional({ enum: StoresSortBy, default: StoresSortBy.CREATED_AT })
  @IsEnum(StoresSortBy)
  @IsOptional()
  sortBy?: StoresSortBy = StoresSortBy.CREATED_AT;
} 