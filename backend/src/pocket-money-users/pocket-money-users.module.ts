import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PocketMoneyUsersService } from './pocket-money-users.service';
import { PocketMoneyUsersController } from './pocket-money-users.controller';
import { PocketMoneyUser } from '../entities/pocket-money-user.entity';
import { AuthProxyModule } from '../auth-proxy/auth-proxy.module';
import { FamiliesModule } from '../families/families.module';

@Module({
  imports: [TypeOrmModule.forFeature([PocketMoneyUser]), AuthProxyModule, FamiliesModule],
  controllers: [PocketMoneyUsersController],
  providers: [PocketMoneyUsersService],
  exports: [PocketMoneyUsersService],
})
export class PocketMoneyUsersModule {}
