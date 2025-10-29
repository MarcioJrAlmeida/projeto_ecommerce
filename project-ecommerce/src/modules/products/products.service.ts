import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Product } from '../../entity/Product';
import { Category } from '../../entity/Category';
import { CreateProductDto, UpdateProductDto } from '../../dto/product.dto';
import { ProductQueryDto } from '../../dto/product.query.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private products: Repository<Product>,
    @InjectRepository(Category) private categories: Repository<Category>,
  ) {}

  findAll() {
    return this.products.find({ relations: ['category'], order: { id: 'DESC' } });
  }

  findOne(id: number) {
    return this.products.findOne({ where: { id }, relations: ['category'] });
  }

  async create(dto: CreateProductDto) {
    const category = await this.categories.findOne({ where: { id: dto.categoryId } });
    if (!category) throw new NotFoundException('Category not found');
    const entity = this.products.create({ ...dto, category });
    return this.products.save(entity);
  }

  async update(id: number, dto: UpdateProductDto) {
    const prod = await this.products.findOne({ where: { id }, relations: ['category'] });
    if (!prod) throw new NotFoundException('Product not found');

    if (dto.categoryId) {
      const cat = await this.categories.findOne({ where: { id: dto.categoryId } });
      if (!cat) throw new NotFoundException('Category not found');
      prod.category = cat;
    }

    Object.assign(prod, { ...dto, category: prod.category });
    return this.products.save(prod);
  }

  async remove(id: number) {
    const res = await this.products.delete(id);
    if (!res.affected) throw new NotFoundException('Product not found');
    return { deleted: true };
  }

  async findPaged(q: ProductQueryDto) {
    const where: FindOptionsWhere<Product> = {};

    if (q.search) where.name = Like(`%${q.search}%`);
    if (q.categoryId) where.category = { id: q.categoryId } as any;
    if (q.active === 'true') where.active = true;
    if (q.active === 'false') where.active = false;

    // faixa de preço -> via where raw (MySQL)
    const qb = this.products.createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'c')
      .where(where);

    if (q.minPrice) qb.andWhere('p.price >= :min', { min: q.minPrice });
    if (q.maxPrice) qb.andWhere('p.price <= :max', { max: q.maxPrice });

    // ordenação
    const sort = (q.sort ?? 'id:desc').split(':');
    const sortField = ['id','name','price','stock'].includes(sort[0]) ? sort[0] : 'id';
    const sortDir = (sort[1] ?? 'desc').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    qb.orderBy(`p.${sortField}`, sortDir);

    // paginação
    const page = q.page ?? 1;
    const limit = q.limit ?? 10;
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

}
