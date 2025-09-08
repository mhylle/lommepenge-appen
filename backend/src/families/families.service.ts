import { Injectable, NotFoundException, Logger, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Family } from '../entities/family.entity';
import { CreateFamilyDto, UpdateFamilyDto } from '../dto/family.dto';

@Injectable()
export class FamiliesService {
  private readonly logger = new Logger(FamiliesService.name);

  constructor(
    @InjectRepository(Family)
    private familiesRepository: Repository<Family>,
  ) {}

  async create(createFamilyDto: CreateFamilyDto): Promise<Family> {
    const family = this.familiesRepository.create(createFamilyDto);
    return await this.familiesRepository.save(family);
  }

  async findAll(): Promise<Family[]> {
    return await this.familiesRepository.find({
      relations: ['children', 'transactions'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Family> {
    const family = await this.familiesRepository.findOne({
      where: { id },
      relations: ['children', 'transactions'],
    });

    if (!family) {
      throw new NotFoundException(`Family with ID "${id}" not found`);
    }

    return family;
  }

  async findByParentUserId(parentUserId: string): Promise<Family[]> {
    return await this.familiesRepository.find({
      where: { parentUserId },
      relations: ['children', 'transactions'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updateFamilyDto: UpdateFamilyDto): Promise<Family> {
    const family = await this.findOne(id);
    
    Object.assign(family, updateFamilyDto);
    return await this.familiesRepository.save(family);
  }

  async remove(id: string): Promise<void> {
    const family = await this.findOne(id);
    await this.familiesRepository.remove(family);
  }

  async findActiveByParentUserId(parentUserId: string): Promise<Family[]> {
    return await this.familiesRepository.find({
      where: { parentUserId, isActive: true },
      relations: ['children', 'transactions'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Check if a parent user already has a family
   */
  async hasFamily(parentUserId: string): Promise<boolean> {
    const count = await this.familiesRepository.count({
      where: { parentUserId, isActive: true },
    });
    return count > 0;
  }

  /**
   * Get the first active family for a parent user
   */
  async getPrimaryFamily(parentUserId: string): Promise<Family | null> {
    const family = await this.familiesRepository.findOne({
      where: { parentUserId, isActive: true },
      relations: ['children', 'transactions'],
      order: { createdAt: 'ASC' }, // Get the first created family
    });

    return family;
  }

  /**
   * Create a default family for a first-time parent login
   * This method is idempotent - it won't create duplicate families
   */
  async createOrGetDefaultFamily(parentUserId: string, parentName: string): Promise<Family> {
    this.logger.log(`Checking for existing family for parent: ${parentUserId}`);

    // Check if family already exists
    const existingFamily = await this.getPrimaryFamily(parentUserId);
    if (existingFamily) {
      this.logger.log(`Family already exists for parent ${parentUserId}: ${existingFamily.id}`);
      return existingFamily;
    }

    // Create default family name in Danish
    const defaultFamilyName = parentName ? `${parentName}s Familie` : 'Min Familie';

    const createFamilyDto: CreateFamilyDto = {
      name: defaultFamilyName,
      description: 'Oprettet automatisk ved første login', // "Created automatically on first login"
      parentUserId,
      currency: 'DKK',
      defaultAllowance: 50.00, // Default 50 DKK weekly allowance
      allowanceFrequency: 'weekly',
    };

    try {
      this.logger.log(`Creating default family for parent ${parentUserId}: ${defaultFamilyName}`);
      const family = await this.create(createFamilyDto);
      this.logger.log(`Successfully created family ${family.id} for parent ${parentUserId}`);
      return family;
    } catch (error) {
      this.logger.error(`Failed to create family for parent ${parentUserId}:`, error);
      
      // Check if family was created by another concurrent request
      const existingFamily = await this.getPrimaryFamily(parentUserId);
      if (existingFamily) {
        this.logger.log(`Found concurrent family creation for parent ${parentUserId}: ${existingFamily.id}`);
        return existingFamily;
      }
      
      throw new ConflictException('Failed to create family. Please try again.');
    }
  }
}