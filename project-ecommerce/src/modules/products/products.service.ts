import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Product } from '../../entity/Product';
// import { Category } from '../../entity/Category';
// import { CreateProductDto, UpdateProductDto } from '../../dto/product.dto';
import { ProductQueryDto } from '../../dto/product.query.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  /**
   * Lista produtos com suporte a paginação e busca por nome/descrição.
   */
  async findAll(params: ProductQueryDto) {
    // garante valores válidos mesmo se vierem nulos/strings
    const page = Math.max(1, Number(params.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(params.limit ?? 12)));
    const search = params.search?.trim();

    const where = search
      ? [{ name: Like(`%${search}%`) }, { description: Like(`%${search}%`) }]
      : undefined;

    const [items, total] = await this.productsRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items,
      total,
      page,
      limit,
    };
  }

  /**
   * Retorna um produto específico pelo ID.
   */
  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }
    return product;
  }

  /**
   * Cria um novo produto.
   */
  async create(data: Partial<Product>): Promise<Product> {
    const product = this.productsRepository.create(data);
    return this.productsRepository.save(product);
  }

  /**
   * Atualiza um produto existente.
   */
  async update(id: number, data: Partial<Product>): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, data);
    return this.productsRepository.save(product);
  }

  /**
   * Remove um produto.
   */
  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);
  }
}
