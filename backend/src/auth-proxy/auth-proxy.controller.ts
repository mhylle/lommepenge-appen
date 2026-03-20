import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  HttpStatus,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import {
  LocalAuthService,
  LoginDto,
  RegisterDto,
  ChildLoginDto,
} from './local-auth.service';
import { ProductionAuthService } from './production-auth.service';
import { FamiliesService } from '../families/families.service';

@Controller('auth')
export class AuthProxyController {
  private readonly logger = new Logger(AuthProxyController.name);
  private readonly authService: LocalAuthService | ProductionAuthService;
  private readonly useProductionAuth: boolean;

  constructor(
    private readonly localAuthService: LocalAuthService,
    private readonly productionAuthService: ProductionAuthService,
    private readonly familiesService: FamiliesService,
  ) {
    // Use production auth service if USE_PRODUCTION_AUTH env var is set to 'true'
    this.useProductionAuth = process.env.USE_PRODUCTION_AUTH === 'true';
    this.authService = this.useProductionAuth
      ? this.productionAuthService
      : this.localAuthService;

    this.logger.log(
      `Using ${this.useProductionAuth ? 'production' : 'local'} authentication service`,
    );
  }

  /**
   * Forward Set-Cookie headers from the central auth service response
   * to the browser response, enabling SSO cookie propagation.
   */
  private forwardSetCookieHeaders(
    res: Response,
    setCookieHeaders?: string[],
  ): void {
    if (setCookieHeaders && setCookieHeaders.length > 0) {
      for (const header of setCookieHeaders) {
        res.append('Set-Cookie', header);
      }
      this.logger.log(
        `Forwarded ${setCookieHeaders.length} Set-Cookie header(s) from central auth`,
      );
    }
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const result = await this.authService.login(loginDto);

      // Forward Set-Cookie headers from central auth for SSO
      if (this.useProductionAuth && result.setCookieHeaders) {
        this.forwardSetCookieHeaders(res, result.setCookieHeaders);
      }

      // Remove setCookieHeaders from the JSON response body (internal field)
      const { setCookieHeaders, ...responseBody } = result;

      // If login is successful and we have user data, ensure family exists
      if (responseBody.success && responseBody.user) {
        try {
          // When using production auth, resolve the LOCAL user by email
          // so that family/transaction queries use the correct local UUID
          let userId = responseBody.user.id;
          if (this.useProductionAuth) {
            const centralUser = responseBody.user;
            let localUser = await this.localAuthService.findByEmail(
              centralUser.email,
            );

            if (!localUser) {
              // Create a local user record linked to the central auth user
              localUser = await this.localAuthService.createLocalUser({
                email: centralUser.email,
                firstName: centralUser.firstName,
                lastName: centralUser.lastName,
                centralAuthUserId: centralUser.id,
              });
            } else if (!localUser.centralAuthUserId) {
              // Link existing local user to central auth if not already linked
              localUser.centralAuthUserId = centralUser.id;
              // Save is handled via the repository in localAuthService,
              // but we have direct access through the service
              this.logger.log(
                `Linking existing local user ${localUser.id} to central auth user ${centralUser.id}`,
              );
            }

            userId = localUser.id;
            this.logger.log(
              `Resolved local user ${userId} for central auth user ${centralUser.id}`,
            );
          }

          const parentName =
            `${responseBody.user.firstName} ${responseBody.user.lastName}`.trim();
          const family = await this.familiesService.createOrGetDefaultFamily(
            userId,
            parentName || responseBody.user.firstName,
          );

          this.logger.log(
            `Family ensured for user ${userId}: ${family.id}`,
          );

          // Add family info to the response
          const enrichedResult = {
            ...responseBody,
            localUserId: this.useProductionAuth ? userId : undefined,
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
          this.logger.warn(
            `Failed to create family for user ${responseBody.user.id}:`,
            familyError,
          );

          // Return original login result with family creation warning
          const resultWithWarning = {
            ...responseBody,
            warnings: [
              'Familie kunne ikke oprettes automatisk. Prøv igen senere.',
            ], // "Family could not be created automatically. Try again later."
          };

          return res.status(HttpStatus.OK).json(resultWithWarning);
        }
      }

      return res.status(HttpStatus.OK).json(responseBody);
    } catch (error) {
      this.logger.error('Login error:', error);
      return res
        .status(error.getStatus?.() || HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error.message });
    }
  }

  @Post('login/child')
  async loginChild(@Body() childLoginDto: ChildLoginDto, @Res() res: Response) {
    try {
      this.logger.log(
        `Attempting child login for username: ${childLoginDto.username}`,
      );

      const result = await this.localAuthService.loginChild(childLoginDto);

      if (result.success && result.user) {
        // For child accounts, fetch family info from the linked PocketMoneyUser
        if (result.user.familyId) {
          try {
            const family = await this.familiesService.findOne(
              result.user.familyId,
            );
            const enrichedResult = {
              ...result,
              family: {
                id: family.id,
                name: family.name,
                currency: family.currency,
                isFirstTime: false,
              },
            };
            return res.status(HttpStatus.OK).json(enrichedResult);
          } catch (familyError) {
            this.logger.warn(
              `Could not fetch family for child login:`,
              familyError,
            );
          }
        }
      }

      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      this.logger.error('Child login error:', error);
      return res
        .status(error.getStatus?.() || HttpStatus.INTERNAL_SERVER_ERROR)
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
      const result = await this.authService.register(registerDto);

      // Forward Set-Cookie headers from central auth for SSO
      if (this.useProductionAuth && result.setCookieHeaders) {
        this.forwardSetCookieHeaders(res, result.setCookieHeaders);
      }

      // Remove setCookieHeaders from the JSON response body (internal field)
      const { setCookieHeaders, ...responseBody } = result;

      // If registration is successful and we have user data, create family
      if (responseBody.success && responseBody.user) {
        try {
          // When using production auth, resolve/create the LOCAL user
          let userId = responseBody.user.id;
          if (this.useProductionAuth) {
            const centralUser = responseBody.user;
            let localUser = await this.localAuthService.findByEmail(
              centralUser.email,
            );

            if (!localUser) {
              localUser = await this.localAuthService.createLocalUser({
                email: centralUser.email,
                firstName: centralUser.firstName,
                lastName: centralUser.lastName,
                centralAuthUserId: centralUser.id,
              });
            }

            userId = localUser.id;
            this.logger.log(
              `Resolved local user ${userId} for central auth user ${centralUser.id}`,
            );
          }

          const parentName =
            `${responseBody.user.firstName} ${responseBody.user.lastName}`.trim();
          const familyName = registerDto.familyName || `${parentName} Familie`;

          const family = await this.familiesService.createOrGetDefaultFamily(
            userId,
            parentName || responseBody.user.firstName,
            familyName,
          );

          this.logger.log(
            `Family created for user ${userId}: ${family.id}`,
          );

          // Add family info to the response
          const enrichedResult = {
            ...responseBody,
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
          this.logger.warn(
            `Failed to create family for new user ${responseBody.user.id}:`,
            familyError,
          );

          // Return original registration result with family creation warning
          const resultWithWarning = {
            ...responseBody,
            warnings: [
              'Familie kunne ikke oprettes automatisk. Du kan oprette en senere.',
            ],
          };

          return res.status(HttpStatus.CREATED).json(resultWithWarning);
        }
      }

      return res.status(HttpStatus.CREATED).json(responseBody);
    } catch (error) {
      this.logger.error('Registration error:', error);
      return res
        .status(error.getStatus?.() || HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error.message });
    }
  }

  @Get('validate')
  @UseGuards(AuthGuard('jwt'))
  async validateSession(@Req() req: Request & { user: any }) {
    try {
      const result = await this.authService.validateByJwt(req.user);

      // If session is valid and we have user data, ensure family exists
      if (result.valid && result.user) {
        try {
          // When using production auth, resolve the LOCAL user by email
          let userId = result.user.id;
          if (this.useProductionAuth) {
            const centralUser = result.user;
            let localUser = await this.localAuthService.findByEmail(
              centralUser.email,
            );

            if (!localUser) {
              localUser = await this.localAuthService.createLocalUser({
                email: centralUser.email,
                firstName: centralUser.firstName,
                lastName: centralUser.lastName,
                centralAuthUserId: centralUser.id,
              });
            }

            userId = localUser.id;
          }

          const parentName =
            `${result.user.firstName} ${result.user.lastName}`.trim();
          const family = await this.familiesService.createOrGetDefaultFamily(
            userId,
            parentName || result.user.firstName,
          );

          // Add family info to the response
          const enrichedResult = {
            ...result,
            localUserId: this.useProductionAuth ? userId : undefined,
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
          this.logger.warn(
            `Failed to create family for user ${result.user.id}:`,
            familyError,
          );
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
  async logout(@Req() req: Request, @Res() res: Response) {
    try {
      const result = await this.authService.logout();

      // Clear the SSO cookie (must match the cookie name and options set by auth service)
      res.clearCookie('auth_token', {
        domain: 'mhylle.com',
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
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
      const result = await this.authService.getCurrentUser(req.user?.id);
      return result;
    } catch (error) {
      this.logger.error('Get current user error:', error);
      return { valid: false };
    }
  }
}
