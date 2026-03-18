import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
import { PocketMoneyUser } from '../entities/pocket-money-user.entity';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export interface LoginDto {
  email: string;
  password: string;
}

export interface ChildLoginDto {
  username: string;
  pin: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  familyName?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    accountType?: string;
    childId?: string;
    familyId?: string;
    permissions: {
      apps: string[];
      roles: Record<string, string[]>;
    };
  };
  access_token?: string;
  message?: string;
}

export interface ValidationResponse {
  valid: boolean;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    accountType?: string;
    childId?: string;
    familyId?: string;
    permissions: {
      apps: string[];
      roles: Record<string, string[]>;
    };
  };
}

@Injectable()
export class LocalAuthService {
  private readonly logger = new Logger(LocalAuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(PocketMoneyUser)
    private pocketMoneyUserRepository: Repository<PocketMoneyUser>,
    private jwtService: JwtService,
  ) {}

  // Rate limiting for child login attempts
  private loginAttempts = new Map<string, { count: number; resetAt: Date }>();
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

  private checkRateLimit(username: string): void {
    const now = new Date();
    const attempt = this.loginAttempts.get(username);

    // Clean up expired entry
    if (attempt && attempt.resetAt <= now) {
      this.loginAttempts.delete(username);
      return;
    }

    if (attempt && attempt.count >= this.MAX_LOGIN_ATTEMPTS) {
      throw new HttpException(
        'For mange loginforsøg. Prøv igen om 15 minutter.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  private recordFailedAttempt(username: string): void {
    const now = new Date();
    const attempt = this.loginAttempts.get(username);

    if (attempt && attempt.resetAt > now) {
      attempt.count++;
    } else {
      this.loginAttempts.set(username, {
        count: 1,
        resetAt: new Date(now.getTime() + this.LOCKOUT_DURATION_MS),
      });
    }
  }

  private clearLoginAttempts(username: string): void {
    this.loginAttempts.delete(username);
  }

  private buildUserResponse(user: User, childId?: string, familyId?: string) {
    // Ensure user has default permissions for app2
    const apps = user.apps || [];
    const roles = user.roles || {};

    // Grant access to app2 for all users by default
    if (!apps.includes('app2')) {
      apps.push('app2');
    }

    // For parent accounts, grant admin role by default (for development)
    if (user.accountType !== 'child') {
      if (!roles.app2 || !roles.app2.includes('admin')) {
        if (!roles.app2) roles.app2 = [];
        roles.app2.push('admin');
      }
    }

    const response: any = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      permissions: {
        apps,
        roles,
      },
    };

    // Add child-specific fields
    if (user.accountType === 'child') {
      response.accountType = 'child';
      response.childId = childId || user.linkedPocketMoneyUserId;
      response.familyId = familyId;
    } else {
      response.accountType = user.accountType || 'parent';
    }

    return response;
  }

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.userRepository.findOne({ where: { email } });
      if (user && (await bcrypt.compare(password, user.password))) {
        const { password: _, ...result } = user;
        return result;
      }
      return null;
    } catch (error) {
      this.logger.error(`Error validating user ${email}:`, error);
      return null;
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    try {
      this.logger.log(`Attempting login for user: ${loginDto.email}`);

      const user = await this.validateUser(loginDto.email, loginDto.password);
      if (!user) {
        throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
      }

      const payload = {
        email: user.email,
        sub: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
      };

      const access_token = this.jwtService.sign(payload);

      this.logger.log(`Login successful for user: ${loginDto.email}`);

      return {
        success: true,
        user: this.buildUserResponse(user),
        access_token,
      };
    } catch (error) {
      this.logger.error(`Login failed for user: ${loginDto.email}`, error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Authentication service error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    try {
      this.logger.log(`Attempting registration for user: ${registerDto.email}`);

      // Check if user already exists
      const existingUser = await this.userRepository.findOne({
        where: { email: registerDto.email },
      });

      if (existingUser) {
        throw new HttpException('User already exists', HttpStatus.CONFLICT);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(registerDto.password, 10);

      // Create user with default permissions
      const user = this.userRepository.create({
        email: registerDto.email,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        password: hashedPassword,
        apps: ['app2'], // Grant access to app2 by default
        roles: { app2: ['admin'] }, // Grant admin role by default for development
      });

      const savedUser = await this.userRepository.save(user);

      // Generate JWT token
      const payload = {
        email: savedUser.email,
        sub: savedUser.id,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
      };

      const access_token = this.jwtService.sign(payload);

      this.logger.log(`Registration successful for user: ${registerDto.email}`);

      return {
        success: true,
        user: this.buildUserResponse(savedUser),
        access_token,
      };
    } catch (error) {
      this.logger.error(
        `Registration failed for user: ${registerDto.email}`,
        error,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Registration failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async validateByJwt(payload: any): Promise<ValidationResponse> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        return { valid: false };
      }

      return {
        valid: true,
        user: this.buildUserResponse(user),
      };
    } catch (error) {
      this.logger.error('JWT validation failed:', error);
      return { valid: false };
    }
  }

  async getCurrentUser(userId: string): Promise<ValidationResponse> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user || !user.isActive) {
        return { valid: false };
      }

      return {
        valid: true,
        user: this.buildUserResponse(user),
      };
    } catch (error) {
      this.logger.error('Get current user failed:', error);
      return { valid: false };
    }
  }

  async logout(): Promise<{ success: boolean }> {
    // With JWT, logout is handled client-side by removing the token
    return { success: true };
  }

  // Seed the database with a test user
  async seedTestUser(): Promise<void> {
    try {
      const testUser = await this.userRepository.findOne({
        where: { email: 'test@familie.dk' },
      });

      if (!testUser) {
        const hashedPassword = await bcrypt.hash('password123', 10);
        const user = this.userRepository.create({
          email: 'test@familie.dk',
          firstName: 'Test',
          lastName: 'Familie',
          password: hashedPassword,
          apps: ['app2'], // Grant access to app2
          roles: { app2: ['admin'] }, // Grant admin role for app2
        });

        await this.userRepository.save(user);
        this.logger.log('Test user created: test@familie.dk / password123');
      } else {
        this.logger.log(
          'Test user already exists: test@familie.dk / password123',
        );
      }
    } catch (error) {
      this.logger.error('Failed to create test user:', error);
    }
  }

  async loginChild(childLoginDto: ChildLoginDto): Promise<AuthResponse> {
    try {
      this.logger.log(
        `Attempting child login for username: ${childLoginDto.username}`,
      );

      // Check rate limit before processing login
      this.checkRateLimit(childLoginDto.username);

      const user = await this.userRepository.findOne({
        where: { username: childLoginDto.username, accountType: 'child' },
      });

      if (!user) {
        this.recordFailedAttempt(childLoginDto.username);
        throw new HttpException(
          'Ugyldigt brugernavn eller PIN',
          HttpStatus.UNAUTHORIZED,
        );
      }

      if (!user.pin) {
        this.recordFailedAttempt(childLoginDto.username);
        throw new HttpException(
          'Barnekonto har ingen PIN konfigureret',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const pinValid = await bcrypt.compare(childLoginDto.pin, user.pin);
      if (!pinValid) {
        this.recordFailedAttempt(childLoginDto.username);
        throw new HttpException(
          'Ugyldigt brugernavn eller PIN',
          HttpStatus.UNAUTHORIZED,
        );
      }

      // Fetch linked PocketMoneyUser for familyId/childId
      let childId: string | undefined;
      let familyId: string | undefined;

      if (user.linkedPocketMoneyUserId) {
        const pocketMoneyUser = await this.pocketMoneyUserRepository.findOne({
          where: { id: user.linkedPocketMoneyUserId },
        });

        if (pocketMoneyUser) {
          childId = pocketMoneyUser.id;
          familyId = pocketMoneyUser.familyId;
        }
      }

      // Clear rate limit on successful login
      this.clearLoginAttempts(childLoginDto.username);

      const payload = {
        email: user.email,
        sub: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: 'child',
        childId,
        familyId,
        accountType: 'child',
      };

      const access_token = this.jwtService.sign(payload);

      this.logger.log(
        `Child login successful for username: ${childLoginDto.username}`,
      );

      return {
        success: true,
        user: this.buildUserResponse(user, childId, familyId),
        access_token,
      };
    } catch (error) {
      this.logger.error(
        `Child login failed for username: ${childLoginDto.username}`,
        error,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Fejl i login-service',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createChildAccount(
    childName: string,
    familyName: string,
    pocketMoneyUserId: string,
    familyId: string,
  ): Promise<{ user: User; plainPin: string }> {
    try {
      this.logger.log(
        `Creating child account for: ${childName} (family: ${familyName})`,
      );

      // Generate username from name.familyname (lowercase, no spaces)
      const baseUsername = `${childName}.${familyName}`
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[^a-z0-9.æøå]/g, '')
        .substring(0, 50);

      // Handle username collision
      let username = baseUsername;
      let suffix = 0;
      let existingUser = await this.userRepository.findOne({
        where: { username },
      });

      while (existingUser) {
        suffix++;
        username = `${baseUsername}${suffix}`;
        existingUser = await this.userRepository.findOne({
          where: { username },
        });
      }

      // Generate random 4-digit PIN
      const plainPin = String(Math.floor(1000 + Math.random() * 9000));
      const hashedPin = await bcrypt.hash(plainPin, 10);

      // Generate synthetic email for the child account
      const syntheticEmail = `child-${uuidv4()}@family.local`;

      // Create a placeholder password (child accounts use PIN, not password)
      const placeholderPassword = await bcrypt.hash(uuidv4(), 10);

      const user = this.userRepository.create({
        email: syntheticEmail,
        firstName: childName,
        lastName: familyName,
        password: placeholderPassword,
        username,
        accountType: 'child',
        pin: hashedPin,
        linkedPocketMoneyUserId: pocketMoneyUserId,
        apps: ['app2'],
        roles: { app2: ['child'] },
      });

      const savedUser = await this.userRepository.save(user);

      this.logger.log(
        `Child account created: username=${username} for child ${childName}`,
      );

      return { user: savedUser, plainPin };
    } catch (error) {
      this.logger.error(
        `Failed to create child account for ${childName}:`,
        error,
      );
      throw new HttpException(
        'Kunne ikke oprette barnekonto',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getChildCredentials(
    childId: string,
  ): Promise<{ username: string } | null> {
    try {
      const pocketMoneyUser = await this.pocketMoneyUserRepository.findOne({
        where: { id: childId },
      });

      if (!pocketMoneyUser || !pocketMoneyUser.authUserId) {
        return null;
      }

      const user = await this.userRepository.findOne({
        where: { id: pocketMoneyUser.authUserId, accountType: 'child' },
      });

      if (!user || !user.username) {
        return null;
      }

      return { username: user.username };
    } catch (error) {
      this.logger.error(
        `Failed to get credentials for child ${childId}:`,
        error,
      );
      return null;
    }
  }

  async resetChildPin(
    childId: string,
  ): Promise<{ username: string; pin: string } | null> {
    try {
      const pocketMoneyUser = await this.pocketMoneyUserRepository.findOne({
        where: { id: childId },
      });

      if (!pocketMoneyUser || !pocketMoneyUser.authUserId) {
        return null;
      }

      const user = await this.userRepository.findOne({
        where: { id: pocketMoneyUser.authUserId, accountType: 'child' },
      });

      if (!user) {
        return null;
      }

      // Generate new PIN
      const plainPin = String(Math.floor(1000 + Math.random() * 9000));
      const hashedPin = await bcrypt.hash(plainPin, 10);

      user.pin = hashedPin;
      await this.userRepository.save(user);

      this.logger.log(`PIN reset for child account: ${user.username}`);

      return { username: user.username, pin: plainPin };
    } catch (error) {
      this.logger.error(`Failed to reset PIN for child ${childId}:`, error);
      return null;
    }
  }
}
