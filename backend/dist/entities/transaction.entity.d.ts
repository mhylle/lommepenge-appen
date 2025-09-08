import { Family } from './family.entity';
import { PocketMoneyUser } from './pocket-money-user.entity';
export declare enum TransactionType {
    ALLOWANCE = "allowance",
    BONUS = "bonus",
    CHORE_REWARD = "chore_reward",
    PURCHASE = "purchase",
    SAVINGS = "savings",
    PENALTY = "penalty",
    GIFT = "gift",
    TRANSFER = "transfer",
    CORRECTION = "correction"
}
export declare enum TransactionStatus {
    COMPLETED = "completed",
    PENDING = "pending",
    CANCELLED = "cancelled"
}
export declare class Transaction {
    id: string;
    userId: string;
    familyId: string;
    type: TransactionType;
    status: TransactionStatus;
    amount: number;
    balanceAfter: number;
    description: string;
    category: string;
    stickerType: string;
    stickerColor: string;
    metadata: {
        choreDetails?: {
            choreName: string;
            completedAt: Date;
            difficulty: 'easy' | 'medium' | 'hard';
        };
        purchaseDetails?: {
            itemName: string;
            store?: string;
            receipt?: string;
        };
        allowanceDetails?: {
            weekStarting: Date;
            weekEnding: Date;
            isRegular: boolean;
        };
        transferDetails?: {
            fromUserId?: string;
            toUserId?: string;
            reason: string;
        };
    };
    createdByUserId: string;
    transactionDate: Date;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
    user: PocketMoneyUser;
    family: Family;
    get isIncome(): boolean;
    get isExpense(): boolean;
    get formattedAmount(): string;
    get displayDescription(): string;
    setTransactionDate(): void;
}
