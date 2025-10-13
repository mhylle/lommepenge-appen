import { Module } from '@nestjs/common';
import { Auth0IntegrationService } from './auth0-integration.service';

@Module({
  providers: [Auth0IntegrationService],
  exports: [Auth0IntegrationService],
})
export class Auth0IntegrationModule {}