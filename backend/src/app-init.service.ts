import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { LocalAuthService } from './auth-proxy/local-auth.service';

@Injectable()
export class AppInitService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AppInitService.name);

  constructor(private localAuthService: LocalAuthService) {}

  async onApplicationBootstrap() {
    this.logger.log('Initializing Lommepenge App...');

    try {
      await this.localAuthService.seedTestUser();
      this.logger.log('Application initialization completed');
    } catch (error) {
      this.logger.error('Failed to initialize application:', error);
    }
  }
}
