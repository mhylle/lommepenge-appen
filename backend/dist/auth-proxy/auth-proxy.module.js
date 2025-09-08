"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthProxyModule = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const typeorm_1 = require("@nestjs/typeorm");
const auth_proxy_service_1 = require("./auth-proxy.service");
const local_auth_service_1 = require("./local-auth.service");
const auth_proxy_controller_1 = require("./auth-proxy.controller");
const auth_guard_1 = require("./auth.guard");
const local_auth_strategy_1 = require("./local-auth.strategy");
const jwt_strategy_1 = require("./jwt.strategy");
const families_module_1 = require("../families/families.module");
const user_entity_1 = require("../entities/user.entity");
let AuthProxyModule = class AuthProxyModule {
};
exports.AuthProxyModule = AuthProxyModule;
exports.AuthProxyModule = AuthProxyModule = __decorate([
    (0, common_1.Module)({
        imports: [
            axios_1.HttpModule.register({
                timeout: 10000,
                maxRedirects: 5,
            }),
            config_1.ConfigModule,
            passport_1.PassportModule,
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'lommepenge_secret_key_for_development_only_2024',
                signOptions: { expiresIn: '7d' },
            }),
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User]),
            families_module_1.FamiliesModule,
        ],
        controllers: [auth_proxy_controller_1.AuthProxyController],
        providers: [
            auth_proxy_service_1.AuthProxyService,
            local_auth_service_1.LocalAuthService,
            auth_guard_1.AuthGuard,
            local_auth_strategy_1.LocalStrategy,
            jwt_strategy_1.JwtStrategy
        ],
        exports: [
            auth_proxy_service_1.AuthProxyService,
            local_auth_service_1.LocalAuthService,
            auth_guard_1.AuthGuard
        ],
    })
], AuthProxyModule);
//# sourceMappingURL=auth-proxy.module.js.map