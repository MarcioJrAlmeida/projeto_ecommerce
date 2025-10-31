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
let ProductsService = class ProductsService {
    constructor(productsRepository) {
        this.productsRepository = productsRepository;
    }
    /**
     * Lista produtos com suporte a paginação e busca por nome/descrição.
     */
    async findAll(params) {
        // garante valores válidos mesmo se vierem nulos/strings
        const page = Math.max(1, Number(params.page ?? 1));
        const limit = Math.min(100, Math.max(1, Number(params.limit ?? 12)));
        const search = params.search?.trim();
        const where = search
            ? [{ name: (0, typeorm_2.Like)(`%${search}%`) }, { description: (0, typeorm_2.Like)(`%${search}%`) }]
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
    async findOne(id) {
        const product = await this.productsRepository.findOne({ where: { id } });
        if (!product) {
            throw new common_1.NotFoundException('Produto não encontrado');
        }
        return product;
    }
    /**
     * Cria um novo produto.
     */
    async create(data) {
        const product = this.productsRepository.create(data);
        return this.productsRepository.save(product);
    }
    /**
     * Atualiza um produto existente.
     */
    async update(id, data) {
        const product = await this.findOne(id);
        Object.assign(product, data);
        return this.productsRepository.save(product);
    }
    /**
     * Remove um produto.
     */
    async remove(id) {
        const product = await this.findOne(id);
        await this.productsRepository.remove(product);
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(Product_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ProductsService);
//# sourceMappingURL=products.service.js.map