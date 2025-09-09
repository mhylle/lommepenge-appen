import { Family } from './family.entity';
export declare class User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    isActive: boolean;
    apps: string[];
    roles: Record<string, string[]>;
    families: Family[];
    createdAt: Date;
    updatedAt: Date;
}
