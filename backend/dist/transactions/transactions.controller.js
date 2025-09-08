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
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsController = void 0;
const common_1 = require("@nestjs/common");
const transactions_service_1 = require("./transactions.service");
const transaction_dto_1 = require("../dto/transaction.dto");
const transaction_entity_1 = require("../entities/transaction.entity");
let TransactionsController = class TransactionsController {
    transactionsService;
    constructor(transactionsService) {
        this.transactionsService = transactionsService;
    }
    async create(createTransactionDto) {
        return await this.transactionsService.create(createTransactionDto);
    }
    async findAll(userId, familyId, type, status) {
        if (userId) {
            return await this.transactionsService.findByUserId(userId);
        }
        if (familyId) {
            return await this.transactionsService.findByFamilyId(familyId);
        }
        if (type) {
            return await this.transactionsService.findByType(type);
        }
        if (status) {
            return await this.transactionsService.findByStatus(status);
        }
        return await this.transactionsService.findAll();
    }
    async getStats(userId) {
        return await this.transactionsService.getTransactionStatsByUserId(userId);
    }
    async findByUserId(userId) {
        return await this.transactionsService.findByUserId(userId);
    }
    async findByFamilyId(familyId) {
        return await this.transactionsService.findByFamilyId(familyId);
    }
    async findByType(type) {
        return await this.transactionsService.findByType(type);
    }
    async findByStatus(status) {
        return await this.transactionsService.findByStatus(status);
    }
    async findByDateRange(userId, startDate, endDate) {
        return await this.transactionsService.findByUserIdAndDateRange(userId, new Date(startDate), new Date(endDate));
    }
    async getFamilyStats(familyId) {
        return await this.transactionsService.getFamilyStatistics(familyId);
    }
    async getRecentTransactions(familyId, limit) {
        const limitNumber = limit ? parseInt(limit, 10) : 5;
        return await this.transactionsService.getRecentTransactionsByFamilyId(familyId, limitNumber);
    }
    async getFamilyTransactionsPaginated(familyId, page, limit) {
        const pageNumber = page ? parseInt(page, 10) : 1;
        const limitNumber = limit ? parseInt(limit, 10) : 10;
        return await this.transactionsService.findByFamilyIdWithPagination(familyId, pageNumber, limitNumber);
    }
    async getLastActivity(userId) {
        const activity = await this.transactionsService.getLastActivityByUserId(userId);
        return { lastActivity: activity };
    }
    async findOne(id) {
        return await this.transactionsService.findOne(id);
    }
    async update(id, updateTransactionDto) {
        return await this.transactionsService.update(id, updateTransactionDto);
    }
    async remove(id) {
        return await this.transactionsService.remove(id);
    }
};
exports.TransactionsController = TransactionsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [transaction_dto_1.CreateTransactionDto]),
    __metadata("design:returntype", typeof (_a = typeof Promise !== "undefined" && Promise) === "function" ? _a : Object)
], TransactionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('familyId')),
    __param(2, (0, common_1.Query)('type')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", typeof (_b = typeof Promise !== "undefined" && Promise) === "function" ? _b : Object)
], TransactionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats/:userId'),
    __param(0, (0, common_1.Param)('userId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('by-user/:userId'),
    __param(0, (0, common_1.Param)('userId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], TransactionsController.prototype, "findByUserId", null);
__decorate([
    (0, common_1.Get)('by-family/:familyId'),
    __param(0, (0, common_1.Param)('familyId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], TransactionsController.prototype, "findByFamilyId", null);
__decorate([
    (0, common_1.Get)('by-type/:type'),
    __param(0, (0, common_1.Param)('type', new common_1.ParseEnumPipe(transaction_entity_1.TransactionType))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], TransactionsController.prototype, "findByType", null);
__decorate([
    (0, common_1.Get)('by-status/:status'),
    __param(0, (0, common_1.Param)('status', new common_1.ParseEnumPipe(transaction_entity_1.TransactionStatus))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], TransactionsController.prototype, "findByStatus", null);
__decorate([
    (0, common_1.Get)('date-range/:userId'),
    __param(0, (0, common_1.Param)('userId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], TransactionsController.prototype, "findByDateRange", null);
__decorate([
    (0, common_1.Get)('family-stats/:familyId'),
    __param(0, (0, common_1.Param)('familyId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "getFamilyStats", null);
__decorate([
    (0, common_1.Get)('recent/:familyId'),
    __param(0, (0, common_1.Param)('familyId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], TransactionsController.prototype, "getRecentTransactions", null);
__decorate([
    (0, common_1.Get)('family-paginated/:familyId'),
    __param(0, (0, common_1.Param)('familyId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "getFamilyTransactionsPaginated", null);
__decorate([
    (0, common_1.Get)('last-activity/:userId'),
    __param(0, (0, common_1.Param)('userId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransactionsController.prototype, "getLastActivity", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_j = typeof Promise !== "undefined" && Promise) === "function" ? _j : Object)
], TransactionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, transaction_dto_1.UpdateTransactionDto]),
    __metadata("design:returntype", typeof (_k = typeof Promise !== "undefined" && Promise) === "function" ? _k : Object)
], TransactionsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_l = typeof Promise !== "undefined" && Promise) === "function" ? _l : Object)
], TransactionsController.prototype, "remove", null);
exports.TransactionsController = TransactionsController = __decorate([
    (0, common_1.Controller)('transactions'),
    __metadata("design:paramtypes", [transactions_service_1.TransactionsService])
], TransactionsController);
//# sourceMappingURL=transactions.controller.js.map