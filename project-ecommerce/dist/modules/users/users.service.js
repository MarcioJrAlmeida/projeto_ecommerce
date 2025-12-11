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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const Users_1 = require("../../entity/Users");
let UsersService = class UsersService {
    constructor(repo) {
        this.repo = repo;
    }
    async findByEmail(email) {
        return this.repo.findOne({ where: { email } });
    }
    async findById(id) {
        return this.repo.findOne({ where: { id } });
    }
    async findAllSafe() {
        const users = await this.repo.find();
        return users.map(({ id, email, role, createdAt, updatedAt }) => ({
            id,
            email,
            role,
            createdAt,
            updatedAt,
        }));
    }
    async findSafeById(id) {
        const user = await this.findById(id);
        if (!user)
            throw new common_1.NotFoundException('Usuário não encontrado');
        const { email, role, createdAt, updatedAt } = user;
        return { id, email, role, createdAt, updatedAt };
    }
    /** Cria usuário com hash de senha, retorna dados seguros */
    async create(dto) {
        const exists = await this.findByEmail(dto.email);
        if (exists)
            throw new common_1.ConflictException('Email já cadastrado');
        const hashed = await bcrypt.hash(dto.password, 10);
        const user = this.repo.create({
            email: dto.email,
            password: hashed,
            role: dto.role ?? 'cliente',
        });
        const saved = await this.repo.save(user);
        const { id, email, role, createdAt, updatedAt } = saved;
        return { id, email, role, createdAt, updatedAt };
    }
    async update(id, dto) {
        const user = await this.findById(id);
        if (!user)
            throw new common_1.NotFoundException('Usuário não encontrado');
        if (dto.email)
            user.email = dto.email;
        if (dto.role)
            user.role = dto.role;
        if (dto.password)
            user.password = await bcrypt.hash(dto.password, 10);
        const saved = await this.repo.save(user);
        const { email, role, createdAt, updatedAt } = saved;
        return { id, email, role, createdAt, updatedAt };
    }
    async remove(id) {
        const user = await this.findById(id);
        if (!user)
            throw new common_1.NotFoundException('Usuário não encontrado');
        await this.repo.delete(id);
        return { success: true };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(Users_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map