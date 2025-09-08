export declare class CreatePocketMoneyUserDto {
    name: string;
    familyId: string;
    dateOfBirth?: string;
    profilePicture?: string;
    cardColor?: string;
    weeklyAllowance?: number;
    authUserId?: string;
    preferences?: {
        favoriteStickers?: string[];
        cardStyle?: string;
        notificationSettings?: {
            allowanceReminder: boolean;
            balanceUpdates: boolean;
        };
    };
    role?: string;
}
export declare class CreateChildDto {
    name: string;
    familyId: string;
    age: number;
    cardColor?: string;
    initialBalance?: number;
    profilePicture?: string;
    weeklyAllowance?: number;
}
export declare class UpdatePocketMoneyUserDto {
    name?: string;
    dateOfBirth?: string;
    profilePicture?: string;
    cardColor?: string;
    weeklyAllowance?: number;
    isActive?: boolean;
    authUserId?: string;
    preferences?: {
        favoriteStickers?: string[];
        cardStyle?: string;
        notificationSettings?: {
            allowanceReminder: boolean;
            balanceUpdates: boolean;
        };
    };
    role?: string;
}
