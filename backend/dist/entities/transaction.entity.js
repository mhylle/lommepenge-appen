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
exports.Transaction = exports.TransactionStatus = exports.TransactionType = void 0;
const typeorm_1 = require("typeorm");
const family_entity_1 = require("./family.entity");
const pocket_money_user_entity_1 = require("./pocket-money-user.entity");
var TransactionType;
(function (TransactionType) {
    TransactionType["ALLOWANCE"] = "allowance";
    TransactionType["BONUS"] = "bonus";
    TransactionType["CHORE_REWARD"] = "chore_reward";
    TransactionType["PURCHASE"] = "purchase";
    TransactionType["SAVINGS"] = "savings";
    TransactionType["PENALTY"] = "penalty";
    TransactionType["GIFT"] = "gift";
    TransactionType["TRANSFER"] = "transfer";
    TransactionType["CORRECTION"] = "correction";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["COMPLETED"] = "completed";
    TransactionStatus["PENDING"] = "pending";
    TransactionStatus["CANCELLED"] = "cancelled";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
let Transaction = class Transaction {
    id;
    userId;
    familyId;
    type;
    status;
    amount;
    balanceAfter;
    description;
    category;
    stickerType;
    stickerColor;
    metadata;
    createdByUserId;
    transactionDate;
    notes;
    createdAt;
    updatedAt;
    user;
    family;
    get isIncome() {
        return this.amount > 0;
    }
    get isExpense() {
        return this.amount < 0;
    }
    get formattedAmount() {
        const absAmount = Math.abs(this.amount);
        const sign = this.isIncome ? '+' : '-';
        return `${sign}${absAmount.toFixed(2)} DKK`;
    }
    get displayDescription() {
        if (this.description) {
            return this.description;
        }
        switch (this.type) {
            case TransactionType.ALLOWANCE:
                return 'Ugentlig lommepenge';
            case TransactionType.BONUS:
                return 'Bonus';
            case TransactionType.CHORE_REWARD:
                return this.metadata?.choreDetails?.choreName
                    ? `Arbejde: ${this.metadata.choreDetails.choreName}`
                    : 'Arbejde belønning';
            case TransactionType.PURCHASE:
                return this.metadata?.purchaseDetails?.itemName
                    ? `Køb: ${this.metadata.purchaseDetails.itemName}`
                    : 'Indkøb';
            case TransactionType.SAVINGS:
                return 'Overførsel til opsparing';
            case TransactionType.PENALTY:
                return 'Straf/fradrag';
            case TransactionType.GIFT:
                return 'Gave';
            case TransactionType.TRANSFER:
                return 'Overførsel';
            default:
                return 'Transaktion';
        }
    }
    setTransactionDate() {
        if (!this.transactionDate) {
            this.transactionDate = new Date();
        }
    }
};
exports.Transaction = Transaction;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Transaction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'userId', nullable: false }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Transaction.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'familyId', nullable: false }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Transaction.prototype, "familyId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 50,
        nullable: false,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Transaction.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 50,
        default: TransactionStatus.COMPLETED,
    }),
    __metadata("design:type", String)
], Transaction.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: false }),
    __metadata("design:type", Number)
], Transaction.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, name: 'balanceAfter', nullable: true }),
    __metadata("design:type", Number)
], Transaction.prototype, "balanceAfter", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true, name: 'stickerType' }),
    __metadata("design:type", String)
], Transaction.prototype, "stickerType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 7, nullable: true, name: 'stickerColor' }),
    __metadata("design:type", String)
], Transaction.prototype, "stickerColor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], Transaction.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'createdByUserId', nullable: false }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Transaction.prototype, "createdByUserId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', name: 'transactionDate', nullable: false }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], Transaction.prototype, "transactionDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], Transaction.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'createdAt' }),
    __metadata("design:type", Date)
], Transaction.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updatedAt' }),
    __metadata("design:type", Date)
], Transaction.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => pocket_money_user_entity_1.PocketMoneyUser, (user) => user.transactions, {
        onDelete: 'CASCADE',
        nullable: true,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", pocket_money_user_entity_1.PocketMoneyUser)
], Transaction.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => family_entity_1.Family, (family) => family.transactions, {
        onDelete: 'CASCADE',
        nullable: true,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'familyId' }),
    __metadata("design:type", family_entity_1.Family)
], Transaction.prototype, "family", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Transaction.prototype, "setTransactionDate", null);
exports.Transaction = Transaction = __decorate([
    (0, typeorm_1.Entity)('transactions')
], Transaction);
//# sourceMappingURL=transaction.entity.js.map