import { Repository } from 'typeorm';
import { Transaction, TransactionType, TransactionStatus } from '../entities/transaction.entity';
import { PocketMoneyUser } from '../entities/pocket-money-user.entity';
import { CreateTransactionDto, UpdateTransactionDto } from '../dto/transaction.dto';
export declare class TransactionsService {
    private transactionsRepository;
    private pocketMoneyUsersRepository;
    constructor(transactionsRepository: Repository<Transaction>, pocketMoneyUsersRepository: Repository<PocketMoneyUser>);
    create(createTransactionDto: CreateTransactionDto): Promise<Transaction>;
    findAll(): Promise<Transaction[]>;
    findOne(id: string): Promise<Transaction>;
    findByUserId(userId: string): Promise<Transaction[]>;
    findByFamilyId(familyId: string): Promise<Transaction[]>;
    findByType(type: TransactionType): Promise<Transaction[]>;
    findByStatus(status: TransactionStatus): Promise<Transaction[]>;
    findByUserIdAndDateRange(userId: string, startDate: Date, endDate: Date): Promise<Transaction[]>;
    findByFamilyIdWithPagination(familyId: string, page?: number, limit?: number): Promise<{
        transactions: Transaction[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getRecentTransactionsByFamilyId(familyId: string, limit?: number): Promise<Transaction[]>;
    getFamilyStatistics(familyId: string): Promise<{
        totalSaved: number;
        childrenCount: number;
        weeklyAllowance: number;
        transactionsThisMonth: number;
        averageBalance: number;
    }>;
    getLastActivityByUserId(userId: string): Promise<string>;
    update(id: string, updateTransactionDto: UpdateTransactionDto): Promise<Transaction>;
    remove(id: string): Promise<void>;
    getTransactionStatsByUserId(userId: string): Promise<{
        totalIncome: number;
        totalExpenses: number;
        currentBalance: number;
        transactionCount: number;
    }>;
}
