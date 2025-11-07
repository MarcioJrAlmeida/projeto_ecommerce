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
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const order_dto_1 = require("../../dto/order.dto");
const orders_service_1 = require("./orders.service");
let OrdersController = class OrdersController {
    constructor(ordersService, service) {
        this.ordersService = ordersService;
        this.service = service;
    }
    async findAll(page, limit, status, search, customerId) {
        return this.ordersService.findAll({
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 12,
            status: status || undefined,
            search: search || undefined,
            customerId: customerId ? Number(customerId) : undefined, // 👈 aplica filtro
        });
    }
    get(id) {
        return this.service.get(id);
    }
    create(dto) {
        return this.service.create(dto);
    }
    addItem(id, dto) {
        return this.service.addItem(id, dto);
    }
    updateItem(orderId, itemId, dto) {
        return this.service.updateItem(orderId, itemId, dto);
    }
    removeItem(orderId) {
        return this.service.removeItem(orderId);
    }
    changeStatus(id, dto) {
        return this.service.setStatus(id, dto.status);
    }
    pay(id) {
        return this.service.pay(id);
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('customerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [order_dto_1.CreateOrderDto]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/items'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, order_dto_1.AddItemDto]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "addItem", null);
__decorate([
    (0, common_1.Put)(':orderId/items/:itemId'),
    __param(0, (0, common_1.Param)('orderId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('itemId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, order_dto_1.UpdateItemDto]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "updateItem", null);
__decorate([
    (0, common_1.Delete)(':id/items/'),
    __param(0, (0, common_1.Param)('orderId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "removeItem", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, order_dto_1.ChangeStatusDto]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "changeStatus", null);
__decorate([
    (0, common_1.Post)(':id/pay'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "pay", null);
exports.OrdersController = OrdersController = __decorate([
    (0, common_1.Controller)('orders'),
    __metadata("design:paramtypes", [orders_service_1.OrdersService,
        orders_service_1.OrderService])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map