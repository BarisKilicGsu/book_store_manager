import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateStoreDto {
  @ApiProperty({
    description: 'The name of the bookstore',
    example: 'City Books',
    minLength: 3,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({
    description: 'The address of the bookstore',
    example: '123 Main Street, City, Country',
    minLength: 5,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  address: string;

  @ApiProperty({ description: 'The phone number of the bookstore', example: '123-456-7890' })
  @IsOptional()
  @IsString()
  phone?: string;
}
