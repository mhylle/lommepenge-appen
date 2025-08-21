import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Message } from './message.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'app2_db',
      entities: [Message],
      synchronize: true, // Only for development
      logging: process.env.NODE_ENV === 'development',
      // Force IPv4 connection and additional connection options
      extra: {
        // PostgreSQL connection options - force IPv4
        options: '--client-min-messages=warning',
        // Ensure connection uses IPv4
        family: 4,
        // Connection pool settings  
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000
      }
    }),
    TypeOrmModule.forFeature([Message]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
