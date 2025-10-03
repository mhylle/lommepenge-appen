import { Family } from './family.entity';
import { Transaction } from './transaction.entity';
export declare class PocketMoneyUser {
    id: string;
    name: string;
    email: string;
    dateOfBirth: Date;
    profilePicture: string;
    cardColor: string;
    role: string;
    currentBalance: number;
    weeklyAllowance: number;
    isActive: boolean;
    preferences: {
        favoriteStickers?: string[];
        cardStyle?: string;
        notificationSettings?: {
            allowanceReminder: boolean;
            balanceUpdates: boolean;
        };
    };
    authUserId: string;
    familyId: string;
    createdAt: Date;
    updatedAt: Date;
    family: Family;
    transactions: Transaction[];
    get age(): number | null;
    get displayName(): string;
    get cardDisplayBalance(): string;
}
