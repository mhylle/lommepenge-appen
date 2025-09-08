import { Repository } from 'typeorm';
import { Family } from '../entities/family.entity';
import { CreateFamilyDto, UpdateFamilyDto } from '../dto/family.dto';
export declare class FamiliesService {
    private familiesRepository;
    private readonly logger;
    constructor(familiesRepository: Repository<Family>);
    create(createFamilyDto: CreateFamilyDto): Promise<Family>;
    findAll(): Promise<Family[]>;
    findOne(id: string): Promise<Family>;
    findByParentUserId(parentUserId: string): Promise<Family[]>;
    update(id: string, updateFamilyDto: UpdateFamilyDto): Promise<Family>;
    remove(id: string): Promise<void>;
    findActiveByParentUserId(parentUserId: string): Promise<Family[]>;
    hasFamily(parentUserId: string): Promise<boolean>;
    getPrimaryFamily(parentUserId: string): Promise<Family | null>;
    createOrGetDefaultFamily(parentUserId: string, parentName: string): Promise<Family>;
}
