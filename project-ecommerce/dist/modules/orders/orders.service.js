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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const Order_1 = require("../../entity/Order");
let OrdersService = class OrdersService {
    constructor(repo) {
        this.repo = repo;
    }
    baseQB() {
        return this.repo
            .createQueryBuilder('o')
            .leftJoinAndSelect('o.customer', 'customer')
            .leftJoinAndSelect('o.items', 'items')
            .leftJoinAndSelect('items.product', 'product');
    }
    async findAll(params) {
        const page = Math.max(1, params.page ?? 1);
        const limit = Math.max(1, Math.min(100, params.limit ?? 12));
        const qb = this.baseQB();
        // 👇 aplica filtro por usuário (customerId) quando informado
        if (params.customerId) {
            // ajuste o nome da coluna se na sua entidade for diferente (ex.: o.customer_id)
            qb.andWhere('o.customerId = :cid', { cid: params.customerId });
        }
        if (params.status) {
            qb.andWhere('o.status = :status', { status: params.status });
        }
        if (params.search) {
            const s = `%${params.search.toLowerCase()}%`;
            qb.andWhere('(LOWER(o.code) LIKE :s OR LOWER(customer.name) LIKE :s OR LOWER(customer.email) LIKE :s)', { s });
        }
        qb.orderBy('o.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);
        const [rows, total] = await qb.getManyAndCount();
        return {
            items: rows,
            total,
            page,
            limit,
        };
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(Order_1.Order)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], OrdersService);
//# sourceMappingURL=orders.service.js.map