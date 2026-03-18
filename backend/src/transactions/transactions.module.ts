import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { Transaction } from '../entities/transaction.entity';
import { PocketMoneyUser } from '../entities/pocket-money-user.entity';
import { AuthProxyModule } from '../auth-proxy/auth-proxy.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, PocketMoneyUser]),
    AuthProxyModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
