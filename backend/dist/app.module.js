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
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const app_init_service_1 = require("./app-init.service");
const entities_1 = require("./entities");
const user_entity_1 = require("./entities/user.entity");
const migrations_module_1 = require("./migrations/migrations.module");
const families_module_1 = require("./families/families.module");
const pocket_money_users_module_1 = require("./pocket-money-users/pocket-money-users.module");
const transactions_module_1 = require("./transactions/transactions.module");
const auth_proxy_module_1 = require("./auth-proxy/auth-proxy.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env.local', '.env'],
            }),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'sqlite',
                database: process.env.NODE_ENV === 'production' ? 'data/lommepenge.db' : 'dev-lommepenge.db',
                entities: [user_entity_1.User, entities_1.Family, entities_1.PocketMoneyUser, entities_1.Transaction],
                synchronize: process.env.NODE_ENV !== 'production',
                logging: process.env.NODE_ENV === 'development',
            }),
            migrations_module_1.MigrationsModule,
            families_module_1.FamiliesModule,
            pocket_money_users_module_1.PocketMoneyUsersModule,
            transactions_module_1.TransactionsModule,
            auth_proxy_module_1.AuthProxyModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService, app_init_service_1.AppInitService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map