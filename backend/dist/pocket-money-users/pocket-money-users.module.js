"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PocketMoneyUsersModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const pocket_money_users_service_1 = require("./pocket-money-users.service");
const pocket_money_users_controller_1 = require("./pocket-money-users.controller");
const pocket_money_user_entity_1 = require("../entities/pocket-money-user.entity");
let PocketMoneyUsersModule = class PocketMoneyUsersModule {
};
exports.PocketMoneyUsersModule = PocketMoneyUsersModule;
exports.PocketMoneyUsersModule = PocketMoneyUsersModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([pocket_money_user_entity_1.PocketMoneyUser])],
        controllers: [pocket_money_users_controller_1.PocketMoneyUsersController],
        providers: [pocket_money_users_service_1.PocketMoneyUsersService],
        exports: [pocket_money_users_service_1.PocketMoneyUsersService],
    })
], PocketMoneyUsersModule);
//# sourceMappingURL=pocket-money-users.module.js.map