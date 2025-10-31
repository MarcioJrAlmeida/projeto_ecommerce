"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const Product_1 = require("../../entity/Product");
const Category_1 = require("../../entity/Category");
let ProductsService = class ProductsService {
    constructor(products, categories) {
        this.products = products;
        this.categories = categories;
    }
    findAll() {
        return this.products.find({ relations: ['category'], order: { id: 'DESC' } });
    }
    findOne(id) {
        return this.products.findOne({ where: { id }, relations: ['category'] });
    }
    async create(dto) {
        const category = await this.categories.findOne({ where: { id: dto.categoryId } });
        if (!category)
            throw new common_1.NotFoundException('Category not found');
        const entity = this.products.create({ ...dto, category });
        return this.products.save(entity);
    }
    async update(id, dto) {
        const prod = await this.products.findOne({ where: { id }, relations: ['category'] });
        if (!prod)
            throw new common_1.NotFoundException('Product not found');
        if (dto.categoryId) {
            const cat = await this.categories.findOne({ where: { id: dto.categoryId } });
            if (!cat)
                throw new common_1.NotFoundException('Category not found');
            prod.category = cat;
        }
        Object.assign(prod, { ...dto, category: prod.category });
        return this.products.save(prod);
    }
    async remove(id) {
        const res = await this.products.delete(id);
        if (!res.affected)
            throw new common_1.NotFoundException('Product not found');
        return { deleted: true };
    }
    async findPaged(q) {
        const where = {};
        if (q.search)
            where.name = (0, typeorm_2.Like)(`%${q.search}%`);
        if (q.categoryId)
            where.category = { id: q.categoryId };
        if (q.active === 'true')
            where.active = true;
        if (q.active === 'false')
            where.active = false;
        // faixa de preço -> via where raw (MySQL)
        const qb = this.products.createQueryBuilder('p')
            .leftJoinAndSelect('p.category', 'c')
            .where(where);
        if (q.minPrice)
            qb.andWhere('p.price >= :min', { min: q.minPrice });
        if (q.maxPrice)
            qb.andWhere('p.price <= :max', { max: q.maxPrice });
        // ordenação
        const sort = (q.sort ?? 'id:desc').split(':');
        const sortField = ['id', 'name', 'price', 'stock'].includes(sort[0]) ? sort[0] : 'id';
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
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(Product_1.Product)),
    __param(1, (0, typeorm_1.InjectRepository)(Category_1.Category)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ProductsService);
//# sourceMappingURL=products.service.js.map