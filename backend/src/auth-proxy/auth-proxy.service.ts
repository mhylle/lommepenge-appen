import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

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
export class AuthProxyService {
  private readonly logger = new Logger(AuthProxyService.name);
  private readonly authServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.authServiceUrl = this.configService.get<string>('AUTH_URL') || 'http://mhylle-auth-service:3000/api/auth';
    this.logger.log(`Auth service URL: ${this.authServiceUrl}`);
  }

  /**
   * Login user through central auth service
   */
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    try {
      this.logger.log(`Attempting login for user: ${loginDto.email}`);
      
      const response: AxiosResponse<AuthResponse> = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/login`, loginDto, {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );

      this.logger.log(`Login successful for user: ${loginDto.email}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Login failed for user: ${loginDto.email}`, error);
      
      if (error.response) {
        throw new HttpException(
          error.response.data?.message || 'Login failed',
          error.response.status || HttpStatus.UNAUTHORIZED
        );
      }
      
      throw new HttpException(
        'Auth service unavailable',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  /**
   * Register new user through central auth service
   */
  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    try {
      this.logger.log(`Attempting registration for user: ${registerDto.email}`);
      
      const response: AxiosResponse<AuthResponse> = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/register`, registerDto, {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );

      this.logger.log(`Registration successful for user: ${registerDto.email}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Registration failed for user: ${registerDto.email}`, error);
      
      if (error.response) {
        throw new HttpException(
          error.response.data?.message || 'Registration failed',
          error.response.status || HttpStatus.BAD_REQUEST
        );
      }
      
      throw new HttpException(
        'Auth service unavailable',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  /**
   * Validate session through central auth service
   */
  async validateSession(cookies: string): Promise<ValidationResponse> {
    try {
      const response: AxiosResponse<ValidationResponse> = await firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/validate`, {
          timeout: 5000,
          headers: {
            Cookie: cookies,
          },
        })
      );

      return response.data;
    } catch (error) {
      this.logger.error('Session validation failed', error);
      
      if (error.response) {
        return { valid: false };
      }
      
      throw new HttpException(
        'Auth service unavailable',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  /**
   * Logout user through central auth service
   */
  async logout(cookies: string): Promise<{ success: boolean }> {
    try {
      const response: AxiosResponse<{ success: boolean }> = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/logout`, {}, {
          timeout: 5000,
          headers: {
            Cookie: cookies,
          },
        })
      );

      return response.data;
    } catch (error) {
      this.logger.error('Logout failed', error);
      
      // Even if logout fails, we consider it successful from client perspective
      return { success: true };
    }
  }

  /**
   * Get current user info through central auth service
   */
  async getCurrentUser(cookies: string): Promise<ValidationResponse> {
    try {
      const response: AxiosResponse<ValidationResponse> = await firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/me`, {
          timeout: 5000,
          headers: {
            Cookie: cookies,
          },
        })
      );

      return response.data;
    } catch (error) {
      this.logger.error('Get current user failed', error);
      return { valid: false };
    }
  }
}