import { FamiliesService } from './families.service';
import { CreateFamilyDto, UpdateFamilyDto } from '../dto/family.dto';
import { Family } from '../entities/family.entity';
export declare class FamiliesController {
    private readonly familiesService;
    constructor(familiesService: FamiliesService);
    create(createFamilyDto: CreateFamilyDto): Promise<Family>;
    findAll(parentUserId?: string): Promise<Family[]>;
    findActive(parentUserId: string): Promise<Family[]>;
    debugSchema(): Promise<any>;
    debugActive(parentUserId: string): Promise<any>;
    findOne(id: string): Promise<Family>;
    update(id: string, updateFamilyDto: UpdateFamilyDto): Promise<Family>;
    remove(id: string): Promise<void>;
}
