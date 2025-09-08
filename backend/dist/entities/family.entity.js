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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Family = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const pocket_money_user_entity_1 = require("./pocket-money-user.entity");
const transaction_entity_1 = require("./transaction.entity");
let Family = class Family {
    id;
    name;
    description;
    parentUserId;
    profilePicture;
    isActive;
    currency;
    defaultAllowance;
    allowanceFrequency;
    createdAt;
    updatedAt;
    parent;
    children;
    transactions;
};
exports.Family = Family;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Family.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: false }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Family.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], Family.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'parent_user_id', nullable: false }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Family.prototype, "parentUserId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], Family.prototype, "profilePicture", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Family.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 3, default: 'DKK' }),
    __metadata("design:type", String)
], Family.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0.00, name: 'default_allowance' }),
    __metadata("design:type", Number)
], Family.prototype, "defaultAllowance", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: 'weekly', name: 'allowance_frequency' }),
    __metadata("design:type", String)
], Family.prototype, "allowanceFrequency", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], Family.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], Family.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, user => user.families, {
        nullable: false,
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'parent_user_id' }),
    __metadata("design:type", user_entity_1.User)
], Family.prototype, "parent", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => pocket_money_user_entity_1.PocketMoneyUser, (user) => user.family, {
        cascade: true,
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", Array)
], Family.prototype, "children", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => transaction_entity_1.Transaction, (transaction) => transaction.family),
    __metadata("design:type", Array)
], Family.prototype, "transactions", void 0);
exports.Family = Family = __decorate([
    (0, typeorm_1.Entity)('families')
], Family);
//# sourceMappingURL=family.entity.js.map