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
exports.OrderService = exports.OrdersService = void 0;
const typeorm_1 = require("typeorm");
const Order_1 = require("../../entity/Order");
const common_1 = require("@nestjs/common");
const typeorm_2 = require("@nestjs/typeorm");
const OrderItem_1 = require("../../entity/OrderItem");
const Product_1 = require("../../entity/Product");
const Customer_1 = require("../../entity/Customer");
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
        if (params.customerId) {
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
    __param(0, (0, typeorm_2.InjectRepository)(Order_1.Order)),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], OrdersService);
let OrderService = class OrderService {
    constructor(orders, items, products, customers, ds) {
        this.orders = orders;
        this.items = items;
        this.products = products;
        this.customers = customers;
        this.ds = ds;
    }
    list() {
        return this.orders.find({ relations: ['customer'], order: { id: 'DESC' } });
    }
    get(id) {
        return this.orders.findOne({ where: { id }, relations: ['customer', 'items', 'items.product'] });
    }
    async create(dto) {
        const customer = await this.customers.findOne({ where: { id: dto.customerId } });
        if (!customer)
            throw new common_1.NotFoundException('Customer not found');
        const o = this.orders.create({ customer, status: 'ABERTO', subtotal: '0.00', total: '0.00', totalItems: 0 });
        return this.orders.save(o);
    }
    async addItem(orderId, dto) {
        const order = await this.getOrThrow(orderId);
        this.ensureEditable(order);
        const product = await this.products.findOne({ where: { id: dto.productId } });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        if (product.stock < dto.quantity) {
            throw new common_1.BadRequestException('Insufficient stock for product');
        }
        let item = await this.items.findOne({ where: { order: { id: order.id }, product: { id: product.id } }, relations: ['order', 'product'] });
        const unitPrice = product.price; // string decimal
        if (item) {
            item.quantity += dto.quantity;
            item.lineTotal = (Number(unitPrice) * item.quantity).toFixed(2);
        }
        else {
            item = this.items.create({
                order,
                product,
                quantity: dto.quantity,
                unitPrice,
                lineTotal: (Number(unitPrice) * dto.quantity).toFixed(2),
            });
        }
        await this.items.save(item);
        await this.recalcTotals(order.id);
        return this.get(order.id);
    }
    async updateItem(orderId, itemId, dto) {
        const order = await this.getOrThrow(orderId);
        this.ensureEditable(order);
        const item = await this.items.findOne({ where: { id: itemId, order: { id: order.id } }, relations: ['product', 'order'] });
        if (!item)
            throw new common_1.NotFoundException('Item not found');
        // checar estoque para a nova quantidade
        if (item.product.stock < dto.quantity) {
            throw new common_1.BadRequestException('Insufficient stock for product');
        }
        item.quantity = dto.quantity;
        item.lineTotal = (Number(item.unitPrice) * item.quantity).toFixed(2);
        await this.items.save(item);
        await this.recalcTotals(order.id);
        return this.get(order.id);
    }
    async removeItem(orderId) {
        const order = await this.getOrThrow(orderId);
        this.ensureEditable(order);
        const res = await this.items.delete({ order: { id: order.id } });
        if (!res.affected)
            throw new common_1.NotFoundException('Item not found');
        await this.recalcTotals(order.id);
        return this.get(order.id);
    }
    async setStatus(orderId, status) {
        const order = await this.getOrThrow(orderId);
        // se já está pago, não permite mais nenhuma mudança
        if (order.status === 'PAGO') {
            throw new common_1.BadRequestException('Paid order cannot change');
        }
        // pagar: debita estoque + marca PAGO
        if (status === 'PAGO') {
            await this.pay(orderId);
            return this.get(orderId);
        }
        // cancelar: só chega aqui se NÃO for PAGO (já barramos acima)
        if (status === 'CANCELADO') {
            order.status = 'CANCELADO';
            return this.orders.save(order);
        }
        // ABERTO <-> AGUARDANDO_PAGAMENTO
        order.status = status;
        return this.orders.save(order);
    }
    /** confirmação de pagamento + débito de estoque (transação) */
    async pay(orderId) {
        const order = await this.getOrThrow(orderId);
        if (order.status === 'PAGO')
            return order;
        if (!order.items?.length)
            throw new common_1.BadRequestException('Order has no items');
        // checar estoque de todos antes de debitar
        for (const it of order.items) {
            const product = await this.products.findOne({ where: { id: it.product.id } });
            if (!product || product.stock < it.quantity) {
                throw new common_1.BadRequestException(`Insufficient stock for product ${it.product.id}`);
            }
        }
        const qr = this.ds.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();
        try {
            // debitar estoque
            for (const it of order.items) {
                await qr.manager.decrement(Product_1.Product, { id: it.product.id }, 'stock', it.quantity);
            }
            // marcar como pago
            await qr.manager.update(Order_1.Order, { id: order.id }, { status: 'PAGO' });
            await qr.commitTransaction();
        }
        catch (e) {
            await qr.rollbackTransaction();
            throw e;
        }
        finally {
            await qr.release();
        }
        return this.get(order.id);
    }
    // ------- helpers -------
    async recalcTotals(orderId) {
        const order = await this.getOrThrow(orderId);
        const items = await this.items.find({ where: { order: { id: orderId } } });
        const subtotal = items.reduce((acc, i) => acc + Number(i.lineTotal), 0);
        order.subtotal = subtotal.toFixed(2);
        order.totalItems = items.reduce((acc, i) => acc + i.quantity, 0);
        order.total = order.subtotal; // por enquanto sem frete/impostos
        await this.orders.save(order);
    }
    async getOrThrow(id) {
        const o = await this.get(id);
        if (!o)
            throw new common_1.NotFoundException('Order not found');
        return o;
    }
    ensureEditable(order) {
        if (order.status === 'PAGO')
            throw new common_1.BadRequestException('Paid order cannot be edited');
        if (order.status === 'CANCELADO')
            throw new common_1.BadRequestException('Canceled order cannot be edited');
    }
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = __decorate([
    __param(0, (0, typeorm_2.InjectRepository)(Order_1.Order)),
    __param(1, (0, typeorm_2.InjectRepository)(OrderItem_1.OrderItem)),
    __param(2, (0, typeorm_2.InjectRepository)(Product_1.Product)),
    __param(3, (0, typeorm_2.InjectRepository)(Customer_1.Customer)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.DataSource])
], OrderService);
//# sourceMappingURL=orders.service.js.map