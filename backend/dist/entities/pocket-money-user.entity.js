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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PocketMoneyUser = void 0;
const typeorm_1 = require("typeorm");
const family_entity_1 = require("./family.entity");
const transaction_entity_1 = require("./transaction.entity");
let PocketMoneyUser = class PocketMoneyUser {
    id;
    name;
    dateOfBirth;
    profilePicture;
    cardColor;
    currentBalance;
    weeklyAllowance;
    isActive;
    authUserId;
    familyId;
    preferences;
    role;
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
        return `${this.currentBalance.toFixed(2)} DKK`;
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
    (0, typeorm_1.Column)({ type: 'date', name: 'date_of_birth', nullable: true }),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], PocketMoneyUser.prototype, "dateOfBirth", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true, name: 'profile_picture' }),
    __metadata("design:type", String)
], PocketMoneyUser.prototype, "profilePicture", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 7, default: '#FFB6C1', name: 'card_color' }),
    __metadata("design:type", String)
], PocketMoneyUser.prototype, "cardColor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0.00, name: 'current_balance' }),
    __metadata("design:type", Number)
], PocketMoneyUser.prototype, "currentBalance", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0.00, name: 'weekly_allowance' }),
    __metadata("design:type", Number)
], PocketMoneyUser.prototype, "weeklyAllowance", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true, name: 'is_active' }),
    __metadata("design:type", Boolean)
], PocketMoneyUser.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'auth_user_id', nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], PocketMoneyUser.prototype, "authUserId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'family_id', nullable: false }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], PocketMoneyUser.prototype, "familyId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], PocketMoneyUser.prototype, "preferences", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: 'child' }),
    __metadata("design:type", String)
], PocketMoneyUser.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], PocketMoneyUser.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], PocketMoneyUser.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => family_entity_1.Family, (family) => family.children, {
        onDelete: 'CASCADE',
        nullable: false,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'family_id' }),
    __metadata("design:type", family_entity_1.Family)
], PocketMoneyUser.prototype, "family", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => transaction_entity_1.Transaction, (transaction) => transaction.user, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], PocketMoneyUser.prototype, "transactions", void 0);
exports.PocketMoneyUser = PocketMoneyUser = __decorate([
    (0, typeorm_1.Entity)('pocket_money_users')
], PocketMoneyUser);
//# sourceMappingURL=pocket-money-user.entity.js.map