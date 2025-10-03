import { TransactionsService } from './transactions.service';
import { CreateTransactionDto, UpdateTransactionDto } from '../dto/transaction.dto';
import { Transaction, TransactionType, TransactionStatus } from '../entities/transaction.entity';
export declare class TransactionsController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    create(createTransactionDto: CreateTransactionDto): Promise<Transaction>;
    findAll(userId?: string, familyId?: string, type?: TransactionType, status?: TransactionStatus): Promise<Transaction[]>;
    getStats(userId: string): Promise<{
        totalIncome: number;
        totalExpenses: number;
        currentBalance: number;
        transactionCount: number;
    }>;
    getChildTransactions(userId: string, limit?: string): Promise<Transaction[]>;
    findByUserId(userId: string): Promise<Transaction[]>;
    findByFamilyId(familyId: string): Promise<Transaction[]>;
    findByType(type: TransactionType): Promise<Transaction[]>;
    findByStatus(status: TransactionStatus): Promise<Transaction[]>;
    findByDateRange(userId: string, startDate: string, endDate: string): Promise<Transaction[]>;
    getFamilyStats(familyId: string): Promise<{
        totalSaved: number;
        childrenCount: number;
        weeklyAllowance: number;
        transactionsThisMonth: number;
        averageBalance: number;
    }>;
    getRecentTransactions(familyId: string, limit?: string): Promise<Transaction[]>;
    getFamilyTransactionsPaginated(familyId: string, page?: string, limit?: string): Promise<{
        transactions: Transaction[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getLastActivity(userId: string): Promise<{
        lastActivity: string;
    }>;
    findOne(id: string): Promise<Transaction>;
    update(id: string, updateTransactionDto: UpdateTransactionDto): Promise<Transaction>;
    remove(id: string): Promise<void>;
}
