import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcryptjs';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
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
  };
}

@Injectable()
export class LocalAuthService {
  private readonly logger = new Logger(LocalAuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.userRepository.findOne({ where: { email } });
      if (user && await bcrypt.compare(password, user.password)) {
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
        lastName: user.lastName 
      };
      
      const access_token = this.jwtService.sign(payload);

      this.logger.log(`Login successful for user: ${loginDto.email}`);
      
      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        access_token,
      };
    } catch (error) {
      this.logger.error(`Login failed for user: ${loginDto.email}`, error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Authentication service error',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    try {
      this.logger.log(`Attempting registration for user: ${registerDto.email}`);
      
      // Check if user already exists
      const existingUser = await this.userRepository.findOne({ 
        where: { email: registerDto.email } 
      });
      
      if (existingUser) {
        throw new HttpException('User already exists', HttpStatus.CONFLICT);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(registerDto.password, 10);
      
      // Create user
      const user = this.userRepository.create({
        email: registerDto.email,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        password: hashedPassword,
      });

      const savedUser = await this.userRepository.save(user);
      
      // Generate JWT token
      const payload = { 
        email: savedUser.email, 
        sub: savedUser.id, 
        firstName: savedUser.firstName, 
        lastName: savedUser.lastName 
      };
      
      const access_token = this.jwtService.sign(payload);

      this.logger.log(`Registration successful for user: ${registerDto.email}`);
      
      return {
        success: true,
        user: {
          id: savedUser.id,
          email: savedUser.email,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
        },
        access_token,
      };
    } catch (error) {
      this.logger.error(`Registration failed for user: ${registerDto.email}`, error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Registration failed',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async validateByJwt(payload: any): Promise<ValidationResponse> {
    try {
      const user = await this.userRepository.findOne({ 
        where: { id: payload.sub } 
      });
      
      if (!user || !user.isActive) {
        return { valid: false };
      }

      return {
        valid: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      };
    } catch (error) {
      this.logger.error('JWT validation failed:', error);
      return { valid: false };
    }
  }

  async getCurrentUser(userId: string): Promise<ValidationResponse> {
    try {
      const user = await this.userRepository.findOne({ 
        where: { id: userId } 
      });
      
      if (!user || !user.isActive) {
        return { valid: false };
      }

      return {
        valid: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
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
        where: { email: 'test@familie.dk' } 
      });

      if (!testUser) {
        const hashedPassword = await bcrypt.hash('password123', 10);
        const user = this.userRepository.create({
          email: 'test@familie.dk',
          firstName: 'Test',
          lastName: 'Familie',
          password: hashedPassword,
        });

        await this.userRepository.save(user);
        this.logger.log('Test user created: test@familie.dk / password123');
      } else {
        this.logger.log('Test user already exists: test@familie.dk / password123');
      }
    } catch (error) {
      this.logger.error('Failed to create test user:', error);
    }
  }
}