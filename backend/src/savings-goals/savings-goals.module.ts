import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavingsGoalsService } from './savings-goals.service';
import { SavingsGoalsController } from './savings-goals.controller';
import { SavingsGoal } from '../entities/savings-goal.entity';
import { PocketMoneyUser } from '../entities/pocket-money-user.entity';
import { AuthProxyModule } from '../auth-proxy/auth-proxy.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SavingsGoal, PocketMoneyUser]),
    AuthProxyModule,
  ],
  controllers: [SavingsGoalsController],
  providers: [SavingsGoalsService],
  exports: [SavingsGoalsService],
})
export class SavingsGoalsModule {}
