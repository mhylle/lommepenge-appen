import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppInitService } from './app-init.service';
import { Family, PocketMoneyUser, Transaction } from './entities';
import { User } from './entities/user.entity';
import { MigrationsModule } from './migrations/migrations.module';
import { FamiliesModule } from './families/families.module';
import { PocketMoneyUsersModule } from './pocket-money-users/pocket-money-users.module';
import { TransactionsModule } from './transactions/transactions.module';
import { AuthProxyModule } from './auth-proxy/auth-proxy.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.NODE_ENV === 'production' ? 'data/lommepenge.db' : 'dev-lommepenge.db',
      entities: [User, Family, PocketMoneyUser, Transaction],
      synchronize: process.env.NODE_ENV !== 'production', // Only for development
      logging: process.env.NODE_ENV === 'development',
    }),
    MigrationsModule,
    FamiliesModule,
    PocketMoneyUsersModule,
    TransactionsModule,
    AuthProxyModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppInitService],
})
export class AppModule {}
