import { TransactionType, TransactionStatus } from '../entities';
export declare class CreateTransactionDto {
    userId: string;
    familyId: string;
    type: TransactionType;
    amount: number;
    description?: string;
    category?: string;
    stickerType?: string;
    stickerColor?: string;
    metadata?: {
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
    transactionDate?: string;
    notes?: string;
}
export declare class UpdateTransactionDto {
    status?: TransactionStatus;
    description?: string;
    category?: string;
    stickerType?: string;
    stickerColor?: string;
    metadata?: any;
    notes?: string;
}
