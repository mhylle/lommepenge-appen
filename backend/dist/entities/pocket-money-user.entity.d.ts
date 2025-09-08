import { Family } from './family.entity';
import { Transaction } from './transaction.entity';
export declare class PocketMoneyUser {
    id: string;
    name: string;
    dateOfBirth: Date;
    profilePicture: string;
    cardColor: string;
    currentBalance: number;
    weeklyAllowance: number;
    isActive: boolean;
    authUserId: string;
    familyId: string;
    preferences: {
        favoriteStickers?: string[];
        cardStyle?: string;
        notificationSettings?: {
            allowanceReminder: boolean;
            balanceUpdates: boolean;
        };
    };
    role: string;
    createdAt: Date;
    updatedAt: Date;
    family: Family;
    transactions: Transaction[];
    get age(): number | null;
    get displayName(): string;
    get cardDisplayBalance(): string;
}
