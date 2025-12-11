"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
require("dotenv/config");
const categories_module_1 = require("./modules/categories/categories.module");
const products_module_1 = require("./modules/products/products.module");
const customers_module_1 = require("./modules/customers/customers.module");
const addresses_module_1 = require("./modules/addresses/addresses.module");
const orders_module_1 = require("./modules/orders/orders.module");
const users_module_1 = require("./modules/users/users.module");
const auth_module_1 = require("./auth/modules/auth.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot({
                type: 'mysql',
                host: 'localhost',
                port: Number(process.env.MYSQL_PORT),
                username: process.env.MYSQL_ROOT_USER,
                password: process.env.MYSQL_ROOT_PASSWORD,
                database: process.env.MYSQL_DATABASE,
                entities: [__dirname + '/**/*.entity{.ts,.js}'],
                synchronize: true,
                autoLoadEntities: true,
            }),
            categories_module_1.CategoriesModule,
            products_module_1.ProductsModule,
            customers_module_1.CustomersModule,
            addresses_module_1.AddressesModule,
            orders_module_1.OrdersModule,
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map