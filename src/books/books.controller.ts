import { Controller, Post, Body, UseGuards, Patch, Param, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { BookEntity } from './entities/book.entity/book.entity';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { GetBooksDto } from './dto/get-books.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/common/constants/role.enum';
import { Public } from 'src/auth/decorators/public.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@ApiTags('Books')
@Controller('books')
@UseGuards(JwtAuthGuard, RolesGuard)    
@ApiBearerAuth('JWT-auth')
export class BooksController {
    constructor(private readonly booksService: BooksService) {}

    @Get()
    @Roles(Role.ADMIN, Role.USER, Role.STORE_MANAGER)
    @ApiOperation({ summary: 'Get all books with pagination and filtering' })
    @ApiResponse({ status: 200, description: 'Returns paginated list of books' })
    getBooks(@Query() query: GetBooksDto) {
        return this.booksService.getBooks(query);
    }

    @Post()
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Create a new book' })
    @ApiResponse({ status: 201, description: 'Book created successfully' })
    @ApiBody({ type: CreateBookDto })
    createBook(@Body() createBookDto: CreateBookDto): Promise<BookEntity> {
        return this.booksService.createBook(createBookDto);
    }

    @Patch(':id')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Update a book' })
    @ApiParam({ name: 'id', description: 'ID of the book to update' })
    @ApiResponse({ status: 200, description: 'Book updated successfully' })
    @ApiBody({ type: UpdateBookDto })
    updateBook(
        @Param('id') id: number,
        @Body() updateBookDto: UpdateBookDto,
    ): Promise<BookEntity> {
        return this.booksService.updateBook(id, updateBookDto);
    }
}