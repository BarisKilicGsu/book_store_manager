import { ApiProperty } from "@nestjs/swagger";
import { UserResponseDto } from "src/user/dto/user-response.dto";

export class LoginResponseDto {
    @ApiProperty({
        description: 'Access token',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
    })
    access_token: string;

    @ApiProperty({
        description: 'User',
        type: UserResponseDto
    })
    user: UserResponseDto;
}

