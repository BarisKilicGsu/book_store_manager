import { ApiProperty } from "@nestjs/swagger";

export class UserResponseDto {
    @ApiProperty({
        description: 'User ID',
        example: '1234567890',
    })
    id: number;

    @ApiProperty({
        description: 'User email',
        example: 'user@example.com',
    })
    email: string;

    @ApiProperty({
        description: 'User role',
        example: 'USER',
    })
    role: string;
}

      