import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class UpdateStoreBookQuantityDto {
    @ApiProperty({
        description: 'The quantity to add (positive) or remove (negative) from the store. ' +
          'For example, use 5 to add 5 books, or -3 to remove 3 books from the store inventory. ' +
          'The final quantity cannot be negative.',
        example: 5
      })
  @IsNotEmpty()
  @IsInt()
  quantity: number;
} 