import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateBookDto {
  @ApiProperty({
    description: 'The title of the book',
    example: 'The Great Gatsby',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'The author of the book',
    example: 'F. Scott Fitzgerald',
    required: false,
  })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiProperty({
    description: 'The price of the book',
    example: 19.99,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty({
    description: 'A description of the book',
    example: 'A story of decadence and excess...',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
} 