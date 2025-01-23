import { Controller, UseGuards, Get, Query, Param, Patch, Body, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { StoresService } from './stores.service';
import { GetStoresDto } from './dto/get-stores.dto';
import { GetStoreBooksDto } from './dto/get-store-books.dto';
import { CreateStoreDto } from './dto/create-stores.dto';
import { Role } from 'src/common/constants/role.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UpdateStoreBookQuantityDto } from './dto/update-store-book-quantity.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { StoreRelatedAccess } from 'src/auth/decorators/store-releted-access.decorator';

@ApiTags('Stores')
@Controller('stores')
@UseGuards(JwtAuthGuard, RolesGuard)   
@ApiBearerAuth('JWT-auth')
@Roles(Role.ADMIN, Role.USER, Role.STORE_MANAGER)
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get()
  @ApiOperation({ summary: 'Get all bookstores with pagination and filtering' })
  @ApiOkResponse({ description: 'Returns paginated list of bookstores' })
  getStores(@Query() query: GetStoresDto) {
    return this.storesService.getStores(query);
  }

  @Get(':storeId/books')
  @ApiOperation({ summary: 'Get all books in a specific bookstore' })
  @ApiParam({ name: 'storeId', description: 'ID of the bookstore' })
  @ApiOkResponse({ description: 'Returns paginated list of books in the store' })
  getStoreBooks(
    @Param('storeId') storeId: number,
    @Query() query: GetStoreBooksDto,
  ) {
    return this.storesService.getStoreBooks(storeId, query);
  }

  @Get('books/search')
  @ApiOperation({ summary: 'Search books across all bookstores' })
  @ApiOkResponse({ description: 'Returns paginated list of books with their bookstores' })
  searchBooksInStores(@Query() query: GetStoreBooksDto) {
    return this.storesService.searchBooksInStores(query);
  }

  @Patch(':storeId/books/:bookId/quantity')
  @ApiOperation({ 
    summary: 'Update book quantity in a store',
    description: 'Updates the available quantity of a specific book in a bookstore. Only store managers of the specific store and admins can perform this operation. The quantity must be a non-negative integer.'
  })
  @ApiParam({ name: 'storeId', description: 'ID of the bookstore' })
  @ApiParam({ name: 'bookId', description: 'ID of the book' })
  @ApiOkResponse({ description: 'Returns updated book quantity in the store' })
  @Roles(Role.ADMIN, Role.STORE_MANAGER)
  @StoreRelatedAccess()
  updateBookQuantity(
    @Param('storeId') storeId: number,
    @Param('bookId') bookId: number,
    @Body() updateQuantityDto: UpdateStoreBookQuantityDto,
  ) {
    return this.storesService.updateBookQuantity(storeId, bookId, updateQuantityDto);
  }


  @Post()
  @ApiOperation({ summary: 'Create a new bookstore' })
  @ApiOkResponse({ description: 'Returns created bookstore' })
  @Roles(Role.ADMIN)
  createStore(@Body() createStoreDto: CreateStoreDto) {
    return this.storesService.createStore(createStoreDto);
  }
}
