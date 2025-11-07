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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const Customer_1 = require("../../entity/Customer");
const Address_1 = require("../../entity/Address");
let AuthService = class AuthService {
    constructor(customersRepo, addressRepo) {
        this.customersRepo = customersRepo;
        this.addressRepo = addressRepo;
    }
    async register(dto) {
        const exists = await this.customersRepo.findOne({ where: { email: dto.email } });
        if (exists)
            throw new common_1.ConflictException('E-mail já cadastrado.');
        // const passwordHash = await bcrypt.hash(dto.password, 10);
        const customer = this.customersRepo.create({
            name: dto.name,
            email: dto.email,
            phone: dto.phone,
            // passwordHash,
        });
        const saved = await this.customersRepo.save(customer);
        if (dto.address) {
            const address = this.addressRepo.create({
                customer: saved,
                line1: dto.address, // ajuste para os campos reais da sua Address
            });
            await this.addressRepo.save(address);
        }
        // Evita vazar o hash
        const { passwordHash: _ph, ...safe } = saved;
        return safe;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(Customer_1.Customer)),
    __param(1, (0, typeorm_1.InjectRepository)(Address_1.Address)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], AuthService);
//# sourceMappingURL=auth.services.js.map