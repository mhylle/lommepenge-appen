import { Repository } from 'typeorm';
import { PocketMoneyUser } from '../entities/pocket-money-user.entity';
import { CreatePocketMoneyUserDto, CreateChildDto, UpdatePocketMoneyUserDto } from '../dto/pocket-money-user.dto';
export declare class PocketMoneyUsersService {
    private pocketMoneyUsersRepository;
    constructor(pocketMoneyUsersRepository: Repository<PocketMoneyUser>);
    create(createUserDto: CreatePocketMoneyUserDto): Promise<PocketMoneyUser>;
    findAll(): Promise<PocketMoneyUser[]>;
    findOne(id: string): Promise<PocketMoneyUser>;
    findByFamilyId(familyId: string): Promise<PocketMoneyUser[]>;
    findByAuthUserId(authUserId: string): Promise<PocketMoneyUser | null>;
    findActiveByFamilyId(familyId: string): Promise<PocketMoneyUser[]>;
    update(id: string, updateUserDto: UpdatePocketMoneyUserDto): Promise<PocketMoneyUser>;
    remove(id: string): Promise<void>;
    updateBalance(id: string, newBalance: number): Promise<PocketMoneyUser>;
    adjustBalance(id: string, amount: number): Promise<PocketMoneyUser>;
    createChild(createChildDto: CreateChildDto): Promise<PocketMoneyUser>;
    getChildrenForFamily(familyId: string): Promise<PocketMoneyUser[]>;
    validateChildNameInFamily(familyId: string, name: string, excludeId?: string): Promise<boolean>;
    verifyChildAccess(childId: string, familyId: string): Promise<boolean>;
}
