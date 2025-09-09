import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { LoginDto, RegisterDto, AuthResponse, ValidationResponse } from './local-auth.service';

@Injectable()
export class ProductionAuthService {
  private readonly logger = new Logger(ProductionAuthService.name);
  private readonly authBaseUrl = 'https://mhylle.com/api/auth';

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const response = await fetch(`${this.authBaseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.user || data.data;
      }
      return null;
    } catch (error) {
      this.logger.error(`Error validating user ${email}:`, error);
      return null;
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    try {
      this.logger.log(`Forwarding login request for user: ${loginDto.email}`);
      
      const response = await fetch(`${this.authBaseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginDto),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new HttpException(
          errorData.message || 'Login failed',
          response.status
        );
      }

      const result = await response.json();
      this.logger.log(`Login successful for user: ${loginDto.email}`);
      
      return {
        success: true,
        user: result.user || result.data,
        access_token: result.access_token || result.token,
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
      this.logger.log(`Forwarding registration request for user: ${registerDto.email}`);
      
      const response = await fetch(`${this.authBaseUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerDto),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new HttpException(
          errorData.message || 'Registration failed',
          response.status
        );
      }

      const result = await response.json();
      this.logger.log(`Registration successful for user: ${registerDto.email}`);
      
      return {
        success: true,
        user: result.user || result.data,
        access_token: result.access_token || result.token,
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
      // For production auth, we would need to validate the JWT
      // This might require sending a validation request to the auth service
      const response = await fetch(`${this.authBaseUrl}/validate`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${payload.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return {
          valid: true,
          user: data.user || data.data,
        };
      }

      return { valid: false };
    } catch (error) {
      this.logger.error('JWT validation failed:', error);
      return { valid: false };
    }
  }

  async getCurrentUser(userId: string): Promise<ValidationResponse> {
    try {
      const response = await fetch(`${this.authBaseUrl}/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userId}`, // This would need the actual token
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return {
          valid: true,
          user: data.user || data.data,
        };
      }

      return { valid: false };
    } catch (error) {
      this.logger.error('Get current user failed:', error);
      return { valid: false };
    }
  }

  async logout(): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`${this.authBaseUrl}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return { success: response.ok };
    } catch (error) {
      this.logger.error('Logout failed:', error);
      return { success: true }; // Don't fail logout on network error
    }
  }

  async seedTestUser(): Promise<void> {
    this.logger.log('Production auth service - no test user seeding needed');
  }
}