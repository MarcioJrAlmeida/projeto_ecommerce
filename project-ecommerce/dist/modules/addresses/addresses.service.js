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
exports.AddressesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const Address_1 = require("../../entity/Address");
const Customer_1 = require("../../entity/Customer");
let AddressesService = class AddressesService {
    constructor(addresses, customers) {
        this.addresses = addresses;
        this.customers = customers;
    }
    async listByCustomer(customerId) {
        return this.addresses.find({
            where: { customer: { id: customerId } },
            order: { isDefault: 'DESC', id: 'DESC' },
        });
    }
    async get(id) {
        const found = await this.addresses.findOne({ where: { id }, relations: ['customer'] });
        if (!found)
            throw new common_1.NotFoundException('Address not found');
        return found;
    }
    /**
     * regra: se criar com isDefault = true, remove o default dos outros endereços do cliente
     */
    async create(customerId, dto) {
        const customer = await this.customers.findOne({ where: { id: customerId } });
        if (!customer)
            throw new common_1.NotFoundException('Customer not found');
        if (dto.isDefault) {
            await this.addresses.update({ customer: { id: customerId }, isDefault: true }, { isDefault: false });
        }
        const entity = this.addresses.create({ ...dto, customer });
        return this.addresses.save(entity);
    }
    async update(id, dto) {
        const addr = await this.addresses.findOne({ where: { id }, relations: ['customer'] });
        if (!addr)
            throw new common_1.NotFoundException('Address not found');
        if (dto.isDefault === true) {
            await this.addresses.update({ customer: { id: addr.customer.id }, isDefault: true }, { isDefault: false });
        }
        Object.assign(addr, dto);
        return this.addresses.save(addr);
    }
    async remove(id) {
        const res = await this.addresses.delete(id);
        if (!res.affected)
            throw new common_1.NotFoundException('Address not found');
        return { deleted: true };
    }
};
exports.AddressesService = AddressesService;
exports.AddressesService = AddressesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(Address_1.Address)),
    __param(1, (0, typeorm_1.InjectRepository)(Customer_1.Customer)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], AddressesService);
//# sourceMappingURL=addresses.service.js.map