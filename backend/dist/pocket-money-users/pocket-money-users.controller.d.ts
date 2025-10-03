import { PocketMoneyUsersService } from './pocket-money-users.service';
import { CreatePocketMoneyUserDto, CreateChildDto, UpdatePocketMoneyUserDto } from '../dto/pocket-money-user.dto';
import { PocketMoneyUser } from '../entities/pocket-money-user.entity';
export declare class PocketMoneyUsersController {
    private readonly pocketMoneyUsersService;
    constructor(pocketMoneyUsersService: PocketMoneyUsersService);
    create(createUserDto: CreatePocketMoneyUserDto): Promise<PocketMoneyUser>;
    createChild(createChildDto: CreateChildDto): Promise<PocketMoneyUser>;
    findAll(familyId?: string): Promise<PocketMoneyUser[]>;
    findActive(familyId: string): Promise<PocketMoneyUser[]>;
    getChildrenForFamily(familyId: string): Promise<PocketMoneyUser[]>;
    validateChildName(familyId: string, name: string, excludeId?: string): Promise<{
        available: boolean;
    }>;
    verifyChildAccess(childId: string, familyId: string): Promise<{
        hasAccess: boolean;
    }>;
    findByAuthUserId(authUserId: string): Promise<PocketMoneyUser | null>;
    getChild(id: string): Promise<PocketMoneyUser>;
    findOne(id: string): Promise<PocketMoneyUser>;
    update(id: string, updateUserDto: UpdatePocketMoneyUserDto): Promise<PocketMoneyUser>;
    updateBalance(id: string, balance: number): Promise<PocketMoneyUser>;
    adjustBalance(id: string, amount: number): Promise<PocketMoneyUser>;
    remove(id: string): Promise<void>;
}
