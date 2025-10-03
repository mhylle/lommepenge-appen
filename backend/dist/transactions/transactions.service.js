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
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const transaction_entity_1 = require("../entities/transaction.entity");
const pocket_money_user_entity_1 = require("../entities/pocket-money-user.entity");
let TransactionsService = class TransactionsService {
    transactionsRepository;
    pocketMoneyUsersRepository;
    constructor(transactionsRepository, pocketMoneyUsersRepository) {
        this.transactionsRepository = transactionsRepository;
        this.pocketMoneyUsersRepository = pocketMoneyUsersRepository;
    }
    async create(createTransactionDto) {
        const user = await this.pocketMoneyUsersRepository.findOne({
            where: { id: createTransactionDto.userId },
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID "${createTransactionDto.userId}" not found`);
        }
        const transaction = this.transactionsRepository.create(createTransactionDto);
        const newBalance = Number(user.currentBalance) + Number(createTransactionDto.amount);
        transaction.balanceAfter = newBalance;
        const savedTransaction = await this.transactionsRepository.save(transaction);
        user.currentBalance = newBalance;
        await this.pocketMoneyUsersRepository.save(user);
        return savedTransaction;
    }
    async findAll() {
        return await this.transactionsRepository.find({
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const transaction = await this.transactionsRepository.findOne({
            where: { id },
        });
        if (!transaction) {
            throw new common_1.NotFoundException(`Transaction with ID "${id}" not found`);
        }
        return transaction;
    }
    async findByUserId(userId) {
        return await this.transactionsRepository.find({
            where: { userId },
            order: { transactionDate: 'DESC', createdAt: 'DESC' },
        });
    }
    async findByFamilyId(familyId) {
        return await this.transactionsRepository.find({
            where: { familyId },
            order: { transactionDate: 'DESC', createdAt: 'DESC' },
        });
    }
    async findByType(type) {
        return await this.transactionsRepository.find({
            where: { type },
            order: { transactionDate: 'DESC', createdAt: 'DESC' },
        });
    }
    async findByStatus(status) {
        return await this.transactionsRepository.find({
            where: { status },
            order: { transactionDate: 'DESC', createdAt: 'DESC' },
        });
    }
    async findByUserIdAndDateRange(userId, startDate, endDate) {
        return await this.transactionsRepository.find({
            where: {
                userId,
                transactionDate: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            order: { transactionDate: 'DESC', createdAt: 'DESC' },
        });
    }
    async findByFamilyIdWithPagination(familyId, page = 1, limit = 10) {
        const [transactions, total] = await this.transactionsRepository.findAndCount({
            where: { familyId },
            order: { transactionDate: 'DESC', createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return {
            transactions,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getRecentTransactionsByFamilyId(familyId, limit = 5) {
        return await this.transactionsRepository.find({
            where: { familyId },
            order: { transactionDate: 'DESC', createdAt: 'DESC' },
            take: limit,
        });
    }
    async getFamilyStatistics(familyId) {
        const transactions = await this.findByFamilyId(familyId);
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonthTransactions = transactions.filter(t => new Date(t.transactionDate) >= startOfMonth);
        const uniqueChildren = new Set(transactions.map(t => t.userId));
        const childrenCount = uniqueChildren.size;
        const totalSaved = transactions
            .filter(t => t.type === transaction_entity_1.TransactionType.SAVINGS && t.status === transaction_entity_1.TransactionStatus.COMPLETED)
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const weeklyAllowance = transactions
            .filter(t => t.type === transaction_entity_1.TransactionType.ALLOWANCE)
            .reduce((sum, t) => sum + Number(t.amount), 0) / 4;
        const userBalances = {};
        for (const userId of uniqueChildren) {
            const user = await this.pocketMoneyUsersRepository.findOne({
                where: { id: userId },
            });
            if (user) {
                userBalances[userId] = Number(user.currentBalance);
            }
        }
        const totalBalance = Object.values(userBalances).reduce((sum, balance) => sum + balance, 0);
        const averageBalance = childrenCount > 0 ? totalBalance / childrenCount : 0;
        return {
            totalSaved,
            childrenCount,
            weeklyAllowance,
            transactionsThisMonth: thisMonthTransactions.length,
            averageBalance,
        };
    }
    async getLastActivityByUserId(userId) {
        const lastTransaction = await this.transactionsRepository.findOne({
            where: { userId, status: transaction_entity_1.TransactionStatus.COMPLETED },
            order: { transactionDate: 'DESC', createdAt: 'DESC' },
        });
        if (!lastTransaction) {
            return 'Ingen aktivitet endnu';
        }
        const amount = Math.abs(Number(lastTransaction.amount));
        const danishTypes = {
            [transaction_entity_1.TransactionType.ALLOWANCE]: 'Ugepenge',
            [transaction_entity_1.TransactionType.CHORE_REWARD]: 'Belønning',
            [transaction_entity_1.TransactionType.PURCHASE]: 'Køb',
            [transaction_entity_1.TransactionType.SAVINGS]: 'Opsparing',
            [transaction_entity_1.TransactionType.PENALTY]: 'Bøde',
            [transaction_entity_1.TransactionType.BONUS]: 'Bonus',
        };
        const typeName = danishTypes[lastTransaction.type] || lastTransaction.type;
        if (lastTransaction.type === transaction_entity_1.TransactionType.PURCHASE) {
            return `${lastTransaction.description} (${amount} kr.)`;
        }
        else {
            return `${typeName}: ${amount} kr.`;
        }
    }
    async update(id, updateTransactionDto) {
        const transaction = await this.findOne(id);
        Object.assign(transaction, updateTransactionDto);
        return await this.transactionsRepository.save(transaction);
    }
    async remove(id) {
        const transaction = await this.findOne(id);
        if (transaction.status === transaction_entity_1.TransactionStatus.COMPLETED) {
            const user = await this.pocketMoneyUsersRepository.findOne({
                where: { id: transaction.userId },
            });
            if (user) {
                user.currentBalance = Number(user.currentBalance) - Number(transaction.amount);
                await this.pocketMoneyUsersRepository.save(user);
            }
        }
        await this.transactionsRepository.remove(transaction);
    }
    async getTransactionStatsByUserId(userId) {
        const transactions = await this.findByUserId(userId);
        const stats = transactions.reduce((acc, transaction) => {
            if (transaction.status === transaction_entity_1.TransactionStatus.COMPLETED) {
                if (transaction.amount > 0) {
                    acc.totalIncome += Number(transaction.amount);
                }
                else {
                    acc.totalExpenses += Math.abs(Number(transaction.amount));
                }
            }
            return acc;
        }, { totalIncome: 0, totalExpenses: 0, currentBalance: 0, transactionCount: 0 });
        stats.transactionCount = transactions.length;
        const user = await this.pocketMoneyUsersRepository.findOne({
            where: { id: userId },
        });
        stats.currentBalance = user ? Number(user.currentBalance) : 0;
        return stats;
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __param(1, (0, typeorm_1.InjectRepository)(pocket_money_user_entity_1.PocketMoneyUser)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map