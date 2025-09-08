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
exports.FamiliesController = void 0;
const common_1 = require("@nestjs/common");
const families_service_1 = require("./families.service");
const family_dto_1 = require("../dto/family.dto");
let FamiliesController = class FamiliesController {
    familiesService;
    constructor(familiesService) {
        this.familiesService = familiesService;
    }
    async create(createFamilyDto) {
        return await this.familiesService.create(createFamilyDto);
    }
    async findAll(parentUserId) {
        if (parentUserId) {
            return await this.familiesService.findByParentUserId(parentUserId);
        }
        return await this.familiesService.findAll();
    }
    async findActive(parentUserId) {
        return await this.familiesService.findActiveByParentUserId(parentUserId);
    }
    async findOne(id) {
        return await this.familiesService.findOne(id);
    }
    async update(id, updateFamilyDto) {
        return await this.familiesService.update(id, updateFamilyDto);
    }
    async remove(id) {
        return await this.familiesService.remove(id);
    }
};
exports.FamiliesController = FamiliesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [family_dto_1.CreateFamilyDto]),
    __metadata("design:returntype", Promise)
], FamiliesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('parentUserId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FamiliesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('active'),
    __param(0, (0, common_1.Query)('parentUserId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FamiliesController.prototype, "findActive", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FamiliesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, family_dto_1.UpdateFamilyDto]),
    __metadata("design:returntype", Promise)
], FamiliesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FamiliesController.prototype, "remove", null);
exports.FamiliesController = FamiliesController = __decorate([
    (0, common_1.Controller)('families'),
    __metadata("design:paramtypes", [families_service_1.FamiliesService])
], FamiliesController);
//# sourceMappingURL=families.controller.js.map