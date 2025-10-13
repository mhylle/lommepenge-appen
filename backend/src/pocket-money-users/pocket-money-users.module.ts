import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PocketMoneyUsersService } from './pocket-money-users.service';
import { PocketMoneyUsersController } from './pocket-money-users.controller';
import { PocketMoneyUser } from '../entities/pocket-money-user.entity';
import { Auth0IntegrationModule } from '../auth0-integration/auth0-integration.module';

@Module({
  imports: [TypeOrmModule.forFeature([PocketMoneyUser]), Auth0IntegrationModule],
  controllers: [PocketMoneyUsersController],
  providers: [PocketMoneyUsersService],
  exports: [PocketMoneyUsersService],
})
export class PocketMoneyUsersModule {}