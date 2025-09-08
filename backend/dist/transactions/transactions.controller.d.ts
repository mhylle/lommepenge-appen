import { TransactionsService } from './transactions.service';
import { CreateTransactionDto, UpdateTransactionDto } from '../dto/transaction.dto';
import { Transaction, TransactionType, TransactionStatus } from '../entities/transaction.entity';
export declare class TransactionsController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    create(createTransactionDto: CreateTransactionDto): Promise<Transaction>;
    findAll(userId?: string, familyId?: string, type?: TransactionType, status?: TransactionStatus): Promise<Transaction[]>;
    getStats(userId: string): unknown;
    findByUserId(userId: string): Promise<Transaction[]>;
    findByFamilyId(familyId: string): Promise<Transaction[]>;
    findByType(type: TransactionType): Promise<Transaction[]>;
    findByStatus(status: TransactionStatus): Promise<Transaction[]>;
    findByDateRange(userId: string, startDate: string, endDate: string): Promise<Transaction[]>;
    getFamilyStats(familyId: string): unknown;
    getRecentTransactions(familyId: string, limit?: string): Promise<Transaction[]>;
    getFamilyTransactionsPaginated(familyId: string, page?: string, limit?: string): unknown;
    getLastActivity(userId: string): unknown;
    findOne(id: string): Promise<Transaction>;
    update(id: string, updateTransactionDto: UpdateTransactionDto): Promise<Transaction>;
    remove(id: string): Promise<void>;
}
