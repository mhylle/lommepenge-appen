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
exports.PocketMoneyUsersController = void 0;
const common_1 = require("@nestjs/common");
const pocket_money_users_service_1 = require("./pocket-money-users.service");
const pocket_money_user_dto_1 = require("../dto/pocket-money-user.dto");
let PocketMoneyUsersController = class PocketMoneyUsersController {
    pocketMoneyUsersService;
    constructor(pocketMoneyUsersService) {
        this.pocketMoneyUsersService = pocketMoneyUsersService;
    }
    async create(createUserDto) {
        return await this.pocketMoneyUsersService.create(createUserDto);
    }
    async createChild(createChildDto) {
        return await this.pocketMoneyUsersService.createChild(createChildDto);
    }
    async findAll(familyId) {
        if (familyId) {
            return await this.pocketMoneyUsersService.findByFamilyId(familyId);
        }
        return await this.pocketMoneyUsersService.findAll();
    }
    async findActive(familyId) {
        return await this.pocketMoneyUsersService.findActiveByFamilyId(familyId);
    }
    async getChildrenForFamily(familyId) {
        return await this.pocketMoneyUsersService.getChildrenForFamily(familyId);
    }
    async validateChildName(familyId, name, excludeId) {
        const available = await this.pocketMoneyUsersService.validateChildNameInFamily(familyId, name, excludeId);
        return { available };
    }
    async findByAuthUserId(authUserId) {
        return await this.pocketMoneyUsersService.findByAuthUserId(authUserId);
    }
    async findOne(id) {
        return await this.pocketMoneyUsersService.findOne(id);
    }
    async update(id, updateUserDto) {
        return await this.pocketMoneyUsersService.update(id, updateUserDto);
    }
    async updateBalance(id, balance) {
        return await this.pocketMoneyUsersService.updateBalance(id, balance);
    }
    async adjustBalance(id, amount) {
        return await this.pocketMoneyUsersService.adjustBalance(id, amount);
    }
    async remove(id) {
        return await this.pocketMoneyUsersService.remove(id);
    }
};
exports.PocketMoneyUsersController = PocketMoneyUsersController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pocket_money_user_dto_1.CreatePocketMoneyUserDto]),
    __metadata("design:returntype", Promise)
], PocketMoneyUsersController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('children'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pocket_money_user_dto_1.CreateChildDto]),
    __metadata("design:returntype", Promise)
], PocketMoneyUsersController.prototype, "createChild", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('familyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PocketMoneyUsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('active'),
    __param(0, (0, common_1.Query)('familyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PocketMoneyUsersController.prototype, "findActive", null);
__decorate([
    (0, common_1.Get)('children/:familyId'),
    __param(0, (0, common_1.Param)('familyId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PocketMoneyUsersController.prototype, "getChildrenForFamily", null);
__decorate([
    (0, common_1.Get)('validate-name/:familyId/:name'),
    __param(0, (0, common_1.Param)('familyId')),
    __param(1, (0, common_1.Param)('name')),
    __param(2, (0, common_1.Query)('excludeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PocketMoneyUsersController.prototype, "validateChildName", null);
__decorate([
    (0, common_1.Get)('by-auth-user/:authUserId'),
    __param(0, (0, common_1.Param)('authUserId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PocketMoneyUsersController.prototype, "findByAuthUserId", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PocketMoneyUsersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pocket_money_user_dto_1.UpdatePocketMoneyUserDto]),
    __metadata("design:returntype", Promise)
], PocketMoneyUsersController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/balance'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)('balance')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], PocketMoneyUsersController.prototype, "updateBalance", null);
__decorate([
    (0, common_1.Patch)(':id/adjust-balance'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)('amount')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], PocketMoneyUsersController.prototype, "adjustBalance", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PocketMoneyUsersController.prototype, "remove", null);
exports.PocketMoneyUsersController = PocketMoneyUsersController = __decorate([
    (0, common_1.Controller)('pocket-money-users'),
    __metadata("design:paramtypes", [pocket_money_users_service_1.PocketMoneyUsersService])
], PocketMoneyUsersController);
//# sourceMappingURL=pocket-money-users.controller.js.map