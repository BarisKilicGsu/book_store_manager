import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsArray } from 'class-validator';
import { Role } from 'src/common/constants/role.enum';

export class CreateUserDto {
  @ApiProperty({
    description: 'Email address of the user',
    example: 'user@example.com'
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password for the user',
    example: 'strongPassword123'
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    description: 'Role of the user',
    enum: Role,
    example: Role.USER
  })
  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;

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