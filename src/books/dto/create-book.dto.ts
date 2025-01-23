import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsNumber, Min, IsOptional } from "class-validator";

export class CreateBookDto {

    @ApiProperty({
        description: 'The title of the book',
        required: true,
        example: 'The Great Gatsby'
    })
    @IsNotEmpty()
    @IsString()
    title: string;

    @ApiProperty({
        description: 'The author of the book',
        required: true,
        example: 'F. Scott Fitzgerald'
    })
    @IsNotEmpty()
    @IsString()
    author: string;

    @ApiProperty({
        description: 'The price of the book',
        required: true,
        example: 19.99,
        minimum: 0
    })
    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    price: number;

    @ApiProperty({
        description: 'A description of the book',
        required: false,
        example: 'A story of decadence and excess...'
    })
    @IsOptional()
    @IsString()
    description?: string;
}   