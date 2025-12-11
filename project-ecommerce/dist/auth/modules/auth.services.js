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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../../modules/users/users.service");
let AuthService = class AuthService {
    constructor(usersService, jwt) {
        this.usersService = usersService;
        this.jwt = jwt;
    }
    /** Registro de usuário (cliente ou admin) */
    async register(dto) {
        // já existe?
        const existing = await this.usersService.findByEmail(dto.email);
        if (existing) {
            throw new common_1.ConflictException('Email já cadastrado');
        }
        // delega criação para UsersService (ele já faz hash da senha)
        const created = await this.usersService.create({
            email: dto.email,
            password: dto.password,
            role: dto.role ?? 'cliente',
        });
        // gera um token já logado
        const payload = { sub: created.id, email: created.email, role: created.role };
        const access_token = await this.jwt.signAsync(payload);
        return { access_token };
    }
    /** Login com email + senha */
    async login(dto) {
        const user = await this.usersService.findByEmail(dto.email);
        if (!user)
            throw new common_1.UnauthorizedException('Credenciais inválidas');
        const ok = await bcrypt.compare(dto.password, user.password);
        if (!ok)
            throw new common_1.UnauthorizedException('Credenciais inválidas');
        const payload = { sub: user.id, email: user.email, role: user.role };
        const access_token = await this.jwt.signAsync(payload);
        return { access_token };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.services.js.map