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
var FamiliesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FamiliesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const family_entity_1 = require("../entities/family.entity");
let FamiliesService = FamiliesService_1 = class FamiliesService {
    familiesRepository;
    logger = new common_1.Logger(FamiliesService_1.name);
    constructor(familiesRepository) {
        this.familiesRepository = familiesRepository;
    }
    async create(createFamilyDto) {
        const family = this.familiesRepository.create(createFamilyDto);
        return await this.familiesRepository.save(family);
    }
    async findAll() {
        return await this.familiesRepository.find({
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const family = await this.familiesRepository.findOne({
            where: { id },
        });
        if (!family) {
            throw new common_1.NotFoundException(`Family with ID "${id}" not found`);
        }
        return family;
    }
    async findByParentUserId(parentUserId) {
        return await this.familiesRepository.find({
            where: { parentUserId },
            order: { createdAt: 'DESC' },
        });
    }
    async update(id, updateFamilyDto) {
        const family = await this.findOne(id);
        Object.assign(family, updateFamilyDto);
        return await this.familiesRepository.save(family);
    }
    async remove(id) {
        const family = await this.findOne(id);
        await this.familiesRepository.remove(family);
    }
    async findActiveByParentUserId(parentUserId) {
        try {
            const families = await this.familiesRepository.find({
                where: { parentUserId, isActive: true },
                order: { createdAt: 'DESC' },
            });
            return families;
        }
        catch (error) {
            this.logger.error('Error in findActiveByParentUserId:', error);
            return [];
        }
    }
    async hasFamily(parentUserId) {
        const count = await this.familiesRepository.count({
            where: { parentUserId, isActive: true },
        });
        return count > 0;
    }
    async getPrimaryFamily(parentUserId) {
        const family = await this.familiesRepository.findOne({
            where: { parentUserId, isActive: true },
            order: { createdAt: 'ASC' },
        });
        return family;
    }
    async createOrGetDefaultFamily(parentUserId, parentName, customFamilyName) {
        this.logger.log(`Checking for existing family for parent: ${parentUserId}`);
        const existingFamily = await this.getPrimaryFamily(parentUserId);
        if (existingFamily) {
            this.logger.log(`Family already exists for parent ${parentUserId}: ${existingFamily.id}`);
            return existingFamily;
        }
        const defaultFamilyName = customFamilyName || (parentName ? `${parentName}s Familie` : 'Min Familie');
        const createFamilyDto = {
            name: defaultFamilyName,
            description: 'Oprettet automatisk ved første login',
            parentUserId,
            currency: 'DKK',
            defaultAllowance: 50.00,
            allowanceFrequency: 'weekly',
        };
        try {
            this.logger.log(`Creating default family for parent ${parentUserId}: ${defaultFamilyName}`);
            const family = await this.create(createFamilyDto);
            this.logger.log(`Successfully created family ${family.id} for parent ${parentUserId}`);
            return family;
        }
        catch (error) {
            this.logger.error(`Failed to create family for parent ${parentUserId}:`, error);
            const existingFamily = await this.getPrimaryFamily(parentUserId);
            if (existingFamily) {
                this.logger.log(`Found concurrent family creation for parent ${parentUserId}: ${existingFamily.id}`);
                return existingFamily;
            }
            throw new common_1.ConflictException('Failed to create family. Please try again.');
        }
    }
    async debugDatabaseSchema() {
        try {
            const tableInfo = await this.familiesRepository.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'pocket_money_users'
        ORDER BY ordinal_position;
      `);
            const migrations = await this.familiesRepository.query(`
        SELECT name, executed_at FROM migrations ORDER BY executed_at DESC LIMIT 10;
      `);
            const familyCount = await this.familiesRepository.count();
            const pocketMoneyCount = await this.familiesRepository.query('SELECT COUNT(*) as count FROM pocket_money_users');
            return {
                timestamp: new Date().toISOString(),
                pocket_money_users_schema: tableInfo,
                recent_migrations: migrations,
                family_count: familyCount,
                pocket_money_users_count: pocketMoneyCount[0].count,
            };
        }
        catch (error) {
            this.logger.error('Error in debugDatabaseSchema:', error);
            return {
                error: error.message,
                stack: error.stack,
            };
        }
    }
    async debugActiveByParentUserId(parentUserId) {
        try {
            const familiesNoRelations = await this.familiesRepository.find({
                where: { parentUserId, isActive: true },
                order: { createdAt: 'DESC' },
            });
            let familiesWithChildren = null;
            let childrenError = null;
            try {
                familiesWithChildren = await this.familiesRepository.find({
                    where: { parentUserId, isActive: true },
                    relations: ['children'],
                    order: { createdAt: 'DESC' },
                });
            }
            catch (error) {
                childrenError = {
                    message: error.message,
                    stack: error.stack,
                };
            }
            return {
                timestamp: new Date().toISOString(),
                parentUserId,
                families_without_relations: familiesNoRelations,
                families_with_children: familiesWithChildren,
                children_relation_error: childrenError,
            };
        }
        catch (error) {
            this.logger.error('Error in debugActiveByParentUserId:', error);
            return {
                error: error.message,
                stack: error.stack,
            };
        }
    }
};
exports.FamiliesService = FamiliesService;
exports.FamiliesService = FamiliesService = FamiliesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(family_entity_1.Family)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], FamiliesService);
//# sourceMappingURL=families.service.js.map