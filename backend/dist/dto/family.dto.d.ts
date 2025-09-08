export declare class CreateFamilyDto {
    name: string;
    description?: string;
    parentUserId: string;
    profilePicture?: string;
    currency?: string;
    defaultAllowance?: number;
    allowanceFrequency?: string;
}
export declare class UpdateFamilyDto {
    name?: string;
    description?: string;
    profilePicture?: string;
    isActive?: boolean;
    currency?: string;
    defaultAllowance?: number;
    allowanceFrequency?: string;
}
