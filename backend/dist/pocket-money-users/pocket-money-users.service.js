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
exports.PocketMoneyUsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const pocket_money_user_entity_1 = require("../entities/pocket-money-user.entity");
let PocketMoneyUsersService = class PocketMoneyUsersService {
    pocketMoneyUsersRepository;
    constructor(pocketMoneyUsersRepository) {
        this.pocketMoneyUsersRepository = pocketMoneyUsersRepository;
    }
    async create(createUserDto) {
        const user = this.pocketMoneyUsersRepository.create(createUserDto);
        return await this.pocketMoneyUsersRepository.save(user);
    }
    async findAll() {
        return await this.pocketMoneyUsersRepository.find({
            relations: ['family', 'transactions'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const user = await this.pocketMoneyUsersRepository.findOne({
            where: { id },
            relations: ['family', 'transactions'],
        });
        if (!user) {
            throw new common_1.NotFoundException(`Pocket money user with ID "${id}" not found`);
        }
        return user;
    }
    async findByFamilyId(familyId) {
        return await this.pocketMoneyUsersRepository.find({
            where: { familyId },
            relations: ['family', 'transactions'],
            order: { name: 'ASC' },
        });
    }
    async findByAuthUserId(authUserId) {
        return await this.pocketMoneyUsersRepository.findOne({
            where: { authUserId },
            relations: ['family', 'transactions'],
        });
    }
    async findActiveByFamilyId(familyId) {
        return await this.pocketMoneyUsersRepository.find({
            where: { familyId, isActive: true },
            relations: ['family', 'transactions'],
            order: { name: 'ASC' },
        });
    }
    async update(id, updateUserDto) {
        const user = await this.findOne(id);
        Object.assign(user, updateUserDto);
        return await this.pocketMoneyUsersRepository.save(user);
    }
    async remove(id) {
        const user = await this.findOne(id);
        await this.pocketMoneyUsersRepository.remove(user);
    }
    async updateBalance(id, newBalance) {
        const user = await this.findOne(id);
        user.currentBalance = newBalance;
        return await this.pocketMoneyUsersRepository.save(user);
    }
    async adjustBalance(id, amount) {
        const user = await this.findOne(id);
        user.currentBalance = Number(user.currentBalance) + amount;
        return await this.pocketMoneyUsersRepository.save(user);
    }
    async createChild(createChildDto) {
        const { age, initialBalance, ...childData } = createChildDto;
        const currentDate = new Date();
        const birthYear = currentDate.getFullYear() - age;
        const dateOfBirth = new Date(birthYear, currentDate.getMonth(), currentDate.getDate());
        const defaultCardColors = [
            '#FFB6C1',
            '#87CEEB',
            '#98FB98',
            '#DDA0DD',
            '#F0E68C',
            '#FFA07A',
            '#20B2AA'
        ];
        const childUser = {
            ...childData,
            dateOfBirth,
            currentBalance: initialBalance || 0,
            cardColor: childData.cardColor || defaultCardColors[Math.floor(Math.random() * defaultCardColors.length)],
            role: age <= 12 ? 'child' : 'teen',
            weeklyAllowance: childData.weeklyAllowance || (age <= 8 ? 25 : age <= 12 ? 50 : 75),
            preferences: {
                favoriteStickers: [],
                cardStyle: 'polaroid',
                notificationSettings: {
                    allowanceReminder: true,
                    balanceUpdates: true
                }
            },
            isActive: true
        };
        try {
            const createdChild = this.pocketMoneyUsersRepository.create(childUser);
            return await this.pocketMoneyUsersRepository.save(createdChild);
        }
        catch (error) {
            throw new common_1.BadRequestException(`Kunne ikke oprette barn: ${error.message}`);
        }
    }
    async getChildrenForFamily(familyId) {
        const children = await this.pocketMoneyUsersRepository.find({
            where: { familyId, isActive: true },
            relations: ['transactions'],
            order: {
                dateOfBirth: 'DESC'
            },
        });
        return children;
    }
    async validateChildNameInFamily(familyId, name, excludeId) {
        const whereCondition = { familyId, name };
        if (excludeId) {
            whereCondition.id = { $ne: excludeId };
        }
        const existingChild = await this.pocketMoneyUsersRepository.findOne({
            where: whereCondition
        });
        return !existingChild;
    }
};
exports.PocketMoneyUsersService = PocketMoneyUsersService;
exports.PocketMoneyUsersService = PocketMoneyUsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(pocket_money_user_entity_1.PocketMoneyUser)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PocketMoneyUsersService);
//# sourceMappingURL=pocket-money-users.service.js.map