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
    // Temporarily remove relations to fix 500 error - children relation causing join failure
    // TODO: Re-enable relations after database schema is fixed
    return await this.familiesRepository.find({
      where: { parentUserId, isActive: true },
      // relations: ['children', 'transactions'], // Commented out temporarily
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
  async createOrGetDefaultFamily(parentUserId: string, parentName: string, customFamilyName?: string): Promise<Family> {
    this.logger.log(`Checking for existing family for parent: ${parentUserId}`);

    // Check if family already exists
    const existingFamily = await this.getPrimaryFamily(parentUserId);
    if (existingFamily) {
      this.logger.log(`Family already exists for parent ${parentUserId}: ${existingFamily.id}`);
      return existingFamily;
    }

    // Create default family name in Danish or use custom name
    const defaultFamilyName = customFamilyName || (parentName ? `${parentName}s Familie` : 'Min Familie');

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

  /**
   * Debug method to check database schema
   */
  async debugDatabaseSchema(): Promise<any> {
    try {
      // Check pocket_money_users table structure
      const tableInfo = await this.familiesRepository.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'pocket_money_users'
        ORDER BY ordinal_position;
      `);

      // Check migrations table
      const migrations = await this.familiesRepository.query(`
        SELECT name, executed_at FROM migrations ORDER BY executed_at DESC LIMIT 10;
      `);

      // Test basic family count
      const familyCount = await this.familiesRepository.count();

      // Test pocket money users count
      const pocketMoneyCount = await this.familiesRepository.query(
        'SELECT COUNT(*) as count FROM pocket_money_users'
      );

      return {
        timestamp: new Date().toISOString(),
        pocket_money_users_schema: tableInfo,
        recent_migrations: migrations,
        family_count: familyCount,
        pocket_money_users_count: pocketMoneyCount[0].count,
      };
    } catch (error) {
      this.logger.error('Error in debugDatabaseSchema:', error);
      return {
        error: error.message,
        stack: error.stack,
      };
    }
  }

  /**
   * Debug method to test active families without relations
   */
  async debugActiveByParentUserId(parentUserId: string): Promise<any> {
    try {
      // First try without any relations
      const familiesNoRelations = await this.familiesRepository.find({
        where: { parentUserId, isActive: true },
        order: { createdAt: 'DESC' },
      });

      let familiesWithChildren = null;
      let childrenError = null;

      // Try to load just children relation
      try {
        familiesWithChildren = await this.familiesRepository.find({
          where: { parentUserId, isActive: true },
          relations: ['children'],
          order: { createdAt: 'DESC' },
        });
      } catch (error) {
        childrenError = {
          message: error.message,
          stack: error.stack,
        };
      }

      return {
        timestamp: new Date().toISOString(),
        parentUserId,
        families_without_relations: familiesNoRelations,
        families_with_children: familiesWithChildren,
        children_relation_error: childrenError,
      };
    } catch (error) {
      this.logger.error('Error in debugActiveByParentUserId:', error);
      return {
        error: error.message,
        stack: error.stack,
      };
    }
  }
}