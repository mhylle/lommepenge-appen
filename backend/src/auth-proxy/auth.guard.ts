import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthProxyService } from './auth-proxy.service';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(private readonly authProxyService: AuthProxyService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const cookies = request.headers.cookie || '';

    if (!cookies) {
      this.logger.warn('No cookies provided in request');
      throw new UnauthorizedException('No authentication token provided');
    }

    try {
      const validationResult =
        await this.authProxyService.validateSession(cookies);

      if (!validationResult.valid) {
        this.logger.warn('Invalid session token');
        throw new UnauthorizedException('Invalid or expired session');
      }

      // Attach user information to request for use in controllers
      request.user = validationResult.user;

      return true;
    } catch (error) {
      this.logger.error('Authentication error:', error);
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
