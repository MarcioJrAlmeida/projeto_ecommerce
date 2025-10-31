import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { ProductQueryDto } from '../../dto/product.query.dto';
import { Product } from '../../entity/Product';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * Lista produtos com paginação e busca.
   * Exemplo: GET /products?page=1&limit=10&search=fone
   */
  @Get()
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(@Query() query: ProductQueryDto) {
    // fallback para evitar falhas de conversão
    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(query.limit ?? 12)));
    return this.productsService.findAll({ ...query, page, limit });
  }

  /**
   * Retorna um produto pelo ID.
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Product> {
    return this.productsService.findOne(id);
  }

  /**
   * Cria um produto (apenas para teste / desenvolvimento).
   */
  @Post()
  create(@Body() body: Partial<Product>): Promise<Product> {
    return this.productsService.create(body);
  }

  /**
   * Atualiza um produto.
   */
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Partial<Product>,
  ): Promise<Product> {
    return this.productsService.update(id, body);
  }

  /**
   * Remove um produto.
   */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.productsService.remove(id);
  }
}
