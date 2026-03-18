import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PocketMoneyUser } from '../entities/pocket-money-user.entity';
import {
  CreatePocketMoneyUserDto,
  CreateChildDto,
  UpdatePocketMoneyUserDto,
} from '../dto/pocket-money-user.dto';
import { LocalAuthService } from '../auth-proxy/local-auth.service';

@Injectable()
export class PocketMoneyUsersService {
  private readonly logger = new Logger(PocketMoneyUsersService.name);

  constructor(
    @InjectRepository(PocketMoneyUser)
    private pocketMoneyUsersRepository: Repository<PocketMoneyUser>,
    private localAuthService: LocalAuthService,
  ) {}

  async create(
    createUserDto: CreatePocketMoneyUserDto,
  ): Promise<PocketMoneyUser> {
    const user = this.pocketMoneyUsersRepository.create(createUserDto);
    return await this.pocketMoneyUsersRepository.save(user);
  }

  async findAll(): Promise<PocketMoneyUser[]> {
    return await this.pocketMoneyUsersRepository.find({
      // relations: ['family', 'transactions'], // Temporarily removed due to database schema issues
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<PocketMoneyUser> {
    const user = await this.pocketMoneyUsersRepository.findOne({
      where: { id },
      // relations: ['family', 'transactions'], // Temporarily removed due to database schema issues
    });

    if (!user) {
      throw new NotFoundException(
        `Pocket money user with ID "${id}" not found`,
      );
    }

    return user;
  }

  async findByFamilyId(familyId: string): Promise<PocketMoneyUser[]> {
    return await this.pocketMoneyUsersRepository.find({
      where: { familyId },
      // relations: ['family', 'transactions'], // Temporarily removed due to database schema issues
      order: { name: 'ASC' },
    });
  }

  async findByAuthUserId(authUserId: string): Promise<PocketMoneyUser | null> {
    return await this.pocketMoneyUsersRepository.findOne({
      where: { authUserId },
      // relations: ['family', 'transactions'], // Temporarily removed due to database schema issues
    });
  }

  async findActiveByFamilyId(familyId: string): Promise<PocketMoneyUser[]> {
    return await this.pocketMoneyUsersRepository.find({
      where: { familyId, isActive: true },
      // relations: ['family', 'transactions'], // Temporarily removed due to database schema issues
      order: { name: 'ASC' },
    });
  }

  async update(
    id: string,
    updateUserDto: UpdatePocketMoneyUserDto,
  ): Promise<PocketMoneyUser> {
    const user = await this.findOne(id);

    Object.assign(user, updateUserDto);
    return await this.pocketMoneyUsersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.pocketMoneyUsersRepository.remove(user);
  }

  async updateBalance(
    id: string,
    newBalance: number,
  ): Promise<PocketMoneyUser> {
    const user = await this.findOne(id);
    user.currentBalance = newBalance;
    return await this.pocketMoneyUsersRepository.save(user);
  }

  async adjustBalance(id: string, amount: number): Promise<PocketMoneyUser> {
    const user = await this.findOne(id);
    user.currentBalance = Number(user.currentBalance) + amount;
    return await this.pocketMoneyUsersRepository.save(user);
  }

  // Specialized method for creating children with enhanced validation and Danish features
  async createChild(
    createChildDto: CreateChildDto,
  ): Promise<
    PocketMoneyUser & { credentials?: { username: string; pin: string } }
  > {
    const { age, initialBalance, ...childData } = createChildDto;

    // Calculate date of birth from age
    const currentDate = new Date();
    const birthYear = currentDate.getFullYear() - age;
    const dateOfBirth = new Date(
      birthYear,
      currentDate.getMonth(),
      currentDate.getDate(),
    );

    // Set default values for Danish children
    const defaultCardColors = [
      '#FFB6C1', // Light Pink
      '#87CEEB', // Sky Blue
      '#98FB98', // Pale Green
      '#DDA0DD', // Plum
      '#F0E68C', // Khaki
      '#FFA07A', // Light Salmon
      '#20B2AA', // Light Sea Green
    ];

    const childUser: Partial<PocketMoneyUser> = {
      ...childData,
      dateOfBirth,
      currentBalance: initialBalance || 0,
      cardColor:
        childData.cardColor ||
        defaultCardColors[Math.floor(Math.random() * defaultCardColors.length)],
      role: age <= 12 ? 'child' : 'teen',
      weeklyAllowance:
        childData.weeklyAllowance || (age <= 8 ? 25 : age <= 12 ? 50 : 75), // Default Danish pocket money rates
      preferences: {
        favoriteStickers: [],
        cardStyle: 'polaroid',
        notificationSettings: {
          allowanceReminder: true,
          balanceUpdates: true,
        },
      },
      isActive: true,
    };

    try {
      const createdChild = this.pocketMoneyUsersRepository.create(childUser);
      const savedChild =
        await this.pocketMoneyUsersRepository.save(createdChild);

      // Create a child login account
      let credentials: { username: string; pin: string } | undefined;
      try {
        // Extract family name from the familyId - we need a human-readable name
        // Use the child's name and a generic family suffix
        const familyName = childData.familyId ? 'familie' : 'familie';
        const { user: authUser, plainPin } =
          await this.localAuthService.createChildAccount(
            childData.name,
            familyName,
            savedChild.id,
            childData.familyId,
          );

        // Link the auth user back to the PocketMoneyUser
        savedChild.authUserId = authUser.id;
        await this.pocketMoneyUsersRepository.save(savedChild);

        credentials = { username: authUser.username, pin: plainPin };
        this.logger.log(
          `Child account created with username: ${authUser.username} for child ${savedChild.id}`,
        );
      } catch (authError) {
        this.logger.warn(
          `Could not create login account for child ${savedChild.id}:`,
          authError,
        );
        // Don't fail child creation if auth account creation fails
      }

      // Return child data with credentials attached
      const result = savedChild as PocketMoneyUser & {
        credentials?: { username: string; pin: string };
      };
      if (credentials) {
        result.credentials = credentials;
      }
      return result;
    } catch (error) {
      throw new BadRequestException(
        `Kunne ikke oprette barn: ${error.message}`,
      );
    }
  }

  // Get children with enhanced display data for Danish UI
  async getChildrenForFamily(familyId: string): Promise<PocketMoneyUser[]> {
    const children = await this.pocketMoneyUsersRepository.find({
      where: { familyId, isActive: true },
      // relations: ['transactions'], // Temporarily removed due to database schema issues
      order: {
        dateOfBirth: 'DESC', // Youngest first
      },
    });

    return children;
  }

  // Validate child name uniqueness within family
  async validateChildNameInFamily(
    familyId: string,
    name: string,
    excludeId?: string,
  ): Promise<boolean> {
    const whereCondition: any = { familyId, name };
    if (excludeId) {
      whereCondition.id = { $ne: excludeId };
    }

    const existingChild = await this.pocketMoneyUsersRepository.findOne({
      where: whereCondition,
    });

    return !existingChild; // true if name is available
  }

  // Verify that a child belongs to a specific family
  async verifyChildAccess(childId: string, familyId: string): Promise<boolean> {
    try {
      const child = await this.pocketMoneyUsersRepository.findOne({
        where: { id: childId, familyId },
      });
      return !!child; // true if child exists and belongs to the family
    } catch (error) {
      console.error('Error verifying child access:', error);
      return false;
    }
  }
}
