import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import {
  LoginDto,
  RegisterDto,
  AuthResponse,
  ValidationResponse,
} from './local-auth.service';

@Injectable()
export class ProductionAuthService {
  private readonly logger = new Logger(ProductionAuthService.name);
  private readonly authBaseUrl = 'https://mhylle.com/api/auth';

  private ensureUserHasPermissions(user: any) {
    // Ensure the user object includes permissions structure
    if (!user.permissions) {
      user.permissions = {
        apps: user.apps || ['app2'], // Default to app2 access
        roles: user.roles || { app2: ['admin'] }, // Default to admin role for app2
      };
    }

    // Ensure user has app2 access
    if (!user.permissions.apps.includes('app2')) {
      user.permissions.apps.push('app2');
    }

    // Ensure user has admin role for app2
    if (
      !user.permissions.roles.app2 ||
      !user.permissions.roles.app2.includes('admin')
    ) {
      if (!user.permissions.roles.app2) user.permissions.roles.app2 = [];
      user.permissions.roles.app2.push('admin');
    }

    return user;
  }

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
        const user = data.user || data.data;
        return user ? this.ensureUserHasPermissions(user) : user;
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
          response.status,
        );
      }

      const result = await response.json();
      this.logger.log(`Login successful for user: ${loginDto.email}`);

      // Capture Set-Cookie headers from the central auth response
      // so the controller can forward them to the browser for SSO
      const setCookieHeaders = response.headers.getSetCookie
        ? response.headers.getSetCookie()
        : [];

      this.logger.log(
        `Captured ${setCookieHeaders.length} Set-Cookie header(s) from central auth`,
      );

      const user = result.user || result.data;
      return {
        success: true,
        user: user ? this.ensureUserHasPermissions(user) : user,
        access_token: result.access_token || result.token,
        setCookieHeaders,
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
      this.logger.log(
        `Forwarding registration request for user: ${registerDto.email}`,
      );

      // Central auth service requires confirmPassword field
      const authPayload = {
        ...registerDto,
        confirmPassword: registerDto.password,
      };

      const response = await fetch(`${this.authBaseUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(authPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new HttpException(
          errorData.message || 'Registration failed',
          response.status,
        );
      }

      const result = await response.json();
      this.logger.log(`Registration successful for user: ${registerDto.email}`);

      // Capture Set-Cookie headers from the central auth response for SSO
      const setCookieHeaders = response.headers.getSetCookie
        ? response.headers.getSetCookie()
        : [];

      const user = result.user || result.data;
      return {
        success: true,
        user: user ? this.ensureUserHasPermissions(user) : user,
        access_token: result.access_token || result.token,
        setCookieHeaders,
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
      // For production auth, we would need to validate the JWT
      // This might require sending a validation request to the auth service
      const response = await fetch(`${this.authBaseUrl}/validate`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${payload.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const user = data.user || data.data;
        return {
          valid: true,
          user: user ? this.ensureUserHasPermissions(user) : user,
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
          Authorization: `Bearer ${userId}`, // This would need the actual token
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const user = data.user || data.data;
        return {
          valid: true,
          user: user ? this.ensureUserHasPermissions(user) : user,
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
