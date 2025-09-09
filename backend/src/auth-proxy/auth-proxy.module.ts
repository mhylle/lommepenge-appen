import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthProxyService } from './auth-proxy.service';
import { LocalAuthService } from './local-auth.service';
import { ProductionAuthService } from './production-auth.service';
import { AuthProxyController } from './auth-proxy.controller';
import { AuthGuard } from './auth.guard';
import { LocalStrategy } from './local-auth.strategy';
import { JwtStrategy } from './jwt.strategy';
import { FamiliesModule } from '../families/families.module';
import { User } from '../entities/user.entity';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
    ConfigModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'lommepenge_secret_key_for_development_only_2024',
      signOptions: { expiresIn: '7d' },
    }),
    TypeOrmModule.forFeature([User]),
    FamiliesModule,
  ],
  controllers: [AuthProxyController],
  providers: [
    AuthProxyService, 
    LocalAuthService,
    ProductionAuthService,
    AuthGuard, 
    LocalStrategy, 
    JwtStrategy
  ],
  exports: [
    AuthProxyService, 
    LocalAuthService,
    AuthGuard
  ],
})
export class AuthProxyModule {}