import { Controller, Post, Get, Body, Req, Res, HttpStatus, Logger, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthService, LoginDto, RegisterDto } from './local-auth.service';
import { FamiliesService } from '../families/families.service';

@Controller('auth')
export class AuthProxyController {
  private readonly logger = new Logger(AuthProxyController.name);

  constructor(
    private readonly localAuthService: LocalAuthService,
    private readonly familiesService: FamiliesService,
  ) {}

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const result = await this.localAuthService.login(loginDto);
      
      // If login is successful and we have user data, ensure family exists
      if (result.success && result.user) {
        try {
          const parentName = `${result.user.firstName} ${result.user.lastName}`.trim();
          const family = await this.familiesService.createOrGetDefaultFamily(
            result.user.id,
            parentName || result.user.firstName,
          );
          
          this.logger.log(`Family ensured for user ${result.user.id}: ${family.id}`);
          
          // Add family info to the response
          const enrichedResult = {
            ...result,
            family: {
              id: family.id,
              name: family.name,
              currency: family.currency,
              isFirstTime: family.description?.includes('automatisk'), // Check if it's a newly created family
            },
          };
          
          return res.status(HttpStatus.OK).json(enrichedResult);
        } catch (familyError) {
          // Don't fail login if family creation fails
          this.logger.warn(`Failed to create family for user ${result.user.id}:`, familyError);
          
          // Return original login result with family creation warning
          const resultWithWarning = {
            ...result,
            warnings: ['Familie kunne ikke oprettes automatisk. Prøv igen senere.'], // "Family could not be created automatically. Try again later."
          };
          
          return res.status(HttpStatus.OK).json(resultWithWarning);
        }
      }
      
      // Note: Cookie forwarding will be handled by the auth service response
      // The auth service should set cookies directly in its response
      
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      this.logger.error('Login error:', error);
      return res.status(error.getStatus?.() || HttpStatus.INTERNAL_SERVER_ERROR)
                .json({ success: false, message: error.message });
    }
  }

  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const result = await this.localAuthService.register(registerDto);
      
      // If registration is successful and we have user data, create family
      if (result.success && result.user) {
        try {
          const parentName = `${result.user.firstName} ${result.user.lastName}`.trim();
          const familyName = registerDto.familyName || `${parentName} Familie`;
          
          const family = await this.familiesService.createOrGetDefaultFamily(
            result.user.id,
            parentName || result.user.firstName,
            familyName,
          );
          
          this.logger.log(`Family created for new user ${result.user.id}: ${family.id}`);
          
          // Add family info to the response
          const enrichedResult = {
            ...result,
            family: {
              id: family.id,
              name: family.name,
              currency: family.currency,
              isFirstTime: true, // Always first time for registration
            },
          };
          
          return res.status(HttpStatus.CREATED).json(enrichedResult);
        } catch (familyError) {
          // Don't fail registration if family creation fails
          this.logger.warn(`Failed to create family for new user ${result.user.id}:`, familyError);
          
          // Return original registration result with family creation warning
          const resultWithWarning = {
            ...result,
            warnings: ['Familie kunne ikke oprettes automatisk. Du kan oprette en senere.'],
          };
          
          return res.status(HttpStatus.CREATED).json(resultWithWarning);
        }
      }
      
      // Note: Cookie forwarding will be handled by the auth service response
      // The auth service should set cookies directly in its response
      
      return res.status(HttpStatus.CREATED).json(result);
    } catch (error) {
      this.logger.error('Registration error:', error);
      return res.status(error.getStatus?.() || HttpStatus.INTERNAL_SERVER_ERROR)
                .json({ success: false, message: error.message });
    }
  }

  @Get('validate')
  @UseGuards(AuthGuard('jwt'))
  async validateSession(@Req() req: Request & { user: any }) {
    try {
      const result = await this.localAuthService.validateByJwt(req.user);
      
      // If session is valid and we have user data, ensure family exists
      if (result.valid && result.user) {
        try {
          const parentName = `${result.user.firstName} ${result.user.lastName}`.trim();
          const family = await this.familiesService.createOrGetDefaultFamily(
            result.user.id,
            parentName || result.user.firstName,
          );
          
          // Add family info to the response
          const enrichedResult = {
            ...result,
            family: {
              id: family.id,
              name: family.name,
              currency: family.currency,
              isFirstTime: family.description?.includes('automatisk'),
            },
          };
          
          return enrichedResult;
        } catch (familyError) {
          // Don't fail validation if family creation fails
          this.logger.warn(`Failed to create family for user ${result.user.id}:`, familyError);
          return result;
        }
      }
      
      return result;
    } catch (error) {
      this.logger.error('Validation error:', error);
      return { valid: false };
    }
  }

  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const result = await this.localAuthService.logout();
      
      // Clear cookies on logout
      res.clearCookie('authToken', { 
        domain: 'mhylle.com',
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'lax'
      });
      
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      this.logger.error('Logout error:', error);
      return res.status(HttpStatus.OK).json({ success: true });
    }
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getCurrentUser(@Req() req: Request & { user: any }) {
    try {
      const result = await this.localAuthService.getCurrentUser(req.user?.id);
      return result;
    } catch (error) {
      this.logger.error('Get current user error:', error);
      return { valid: false };
    }
  }
}