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
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER || 'app2_user',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'mhylle_app2',
      entities: [User, Family, PocketMoneyUser, Transaction],
      synchronize: process.env.NODE_ENV !== 'production', // Only for development
      logging: process.env.NODE_ENV === 'development',
      retryAttempts: 3,
      retryDelay: 3000,
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
