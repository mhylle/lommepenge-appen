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
exports.PocketMoneyUser = void 0;
const typeorm_1 = require("typeorm");
const family_entity_1 = require("./family.entity");
const transaction_entity_1 = require("./transaction.entity");
let PocketMoneyUser = class PocketMoneyUser {
    id;
    name;
    email;
    dateOfBirth;
    profilePicture;
    cardColor;
    role;
    currentBalance;
    weeklyAllowance;
    isActive;
    preferences;
    authUserId;
    familyId;
    createdAt;
    updatedAt;
    family;
    transactions;
    get age() {
        if (!this.dateOfBirth)
            return null;
        const today = new Date();
        const birthDate = new Date(this.dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }
    get displayName() {
        return this.name;
    }
    get cardDisplayBalance() {
        const balance = Number(this.currentBalance) || 0;
        return `${balance.toFixed(2)} DKK`;
    }
};
exports.PocketMoneyUser = PocketMoneyUser;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PocketMoneyUser.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: false }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], PocketMoneyUser.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], PocketMoneyUser.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true, name: 'dateOfBirth' }),
    __metadata("design:type", Date)
], PocketMoneyUser.prototype, "dateOfBirth", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true, name: 'profilePicture' }),
    __metadata("design:type", String)
], PocketMoneyUser.prototype, "profilePicture", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 7, default: '#FFB6C1', name: 'cardColor' }),
    __metadata("design:type", String)
], PocketMoneyUser.prototype, "cardColor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: 'child' }),
    __metadata("design:type", String)
], PocketMoneyUser.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0.00, name: 'currentBalance' }),
    __metadata("design:type", Number)
], PocketMoneyUser.prototype, "currentBalance", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0.00, name: 'weeklyAllowance' }),
    __metadata("design:type", Number)
], PocketMoneyUser.prototype, "weeklyAllowance", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true, name: 'isActive' }),
    __metadata("design:type", Boolean)
], PocketMoneyUser.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], PocketMoneyUser.prototype, "preferences", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'authUserId', nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], PocketMoneyUser.prototype, "authUserId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'familyId', nullable: false }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], PocketMoneyUser.prototype, "familyId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'createdAt' }),
    __metadata("design:type", Date)
], PocketMoneyUser.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updatedAt' }),
    __metadata("design:type", Date)
], PocketMoneyUser.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => family_entity_1.Family, (family) => family.children, {
        onDelete: 'CASCADE',
        nullable: true,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'familyId' }),
    __metadata("design:type", family_entity_1.Family)
], PocketMoneyUser.prototype, "family", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => transaction_entity_1.Transaction, (transaction) => transaction.user, {
        cascade: false,
    }),
    __metadata("design:type", Array)
], PocketMoneyUser.prototype, "transactions", void 0);
exports.PocketMoneyUser = PocketMoneyUser = __decorate([
    (0, typeorm_1.Entity)('pocket_money_users')
], PocketMoneyUser);
//# sourceMappingURL=pocket-money-user.entity.js.map