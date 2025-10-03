import { PocketMoneyUser } from './pocket-money-user.entity';
import { Transaction } from './transaction.entity';
export declare class Family {
    id: string;
    name: string;
    description: string;
    parentUserId: string;
    profilePicture: string;
    isActive: boolean;
    currency: string;
    defaultAllowance: number;
    allowanceFrequency: string;
    createdAt: Date;
    updatedAt: Date;
    children: PocketMoneyUser[];
    transactions: Transaction[];
}
