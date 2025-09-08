import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { Transaction } from '../entities/transaction.entity';
import { PocketMoneyUser } from '../entities/pocket-money-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, PocketMoneyUser])],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}