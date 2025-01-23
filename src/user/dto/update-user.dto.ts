import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsArray, IsString } from 'class-validator';
import { Role } from 'src/common/constants/role.enum';

export class UpdateUserDto {
  @ApiProperty({
    description: 'New role of the user',
    enum: Role,
    required: false,
    example: Role.STORE_MANAGER
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiProperty({
    description: 'Store IDs that the user will manage (required only if role is STORE_MANAGER)',
    type: [String],
    required: false,
    example: ['store-id-1', 'store-id-2']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  storeIds?: number[];
} 