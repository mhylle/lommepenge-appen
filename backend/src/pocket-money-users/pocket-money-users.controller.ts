import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ParentOnlyGuard } from '../auth-proxy/parent-only.guard';
import { PocketMoneyUsersService } from './pocket-money-users.service';
import { LocalAuthService } from '../auth-proxy/local-auth.service';
import { FamiliesService } from '../families/families.service';
import {
  CreatePocketMoneyUserDto,
  CreateChildDto,
  UpdatePocketMoneyUserDto,
} from '../dto/pocket-money-user.dto';
import { PocketMoneyUser } from '../entities/pocket-money-user.entity';

@Controller('pocket-money-users')
export class PocketMoneyUsersController {
  constructor(
    private readonly pocketMoneyUsersService: PocketMoneyUsersService,
    private readonly localAuthService: LocalAuthService,
    private readonly familiesService: FamiliesService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), ParentOnlyGuard)
  async create(
    @Body() createUserDto: CreatePocketMoneyUserDto,
  ): Promise<PocketMoneyUser> {
    return await this.pocketMoneyUsersService.create(createUserDto);
  }

  @Post('children')
  @UseGuards(AuthGuard('jwt'), ParentOnlyGuard)
  async createChild(
    @Body() createChildDto: CreateChildDto,
  ): Promise<PocketMoneyUser> {
    return await this.pocketMoneyUsersService.createChild(createChildDto);
  }

  @Get()
  async findAll(
    @Query('familyId') familyId?: string,
  ): Promise<PocketMoneyUser[]> {
    if (familyId) {
      return await this.pocketMoneyUsersService.findByFamilyId(familyId);
    }
    return await this.pocketMoneyUsersService.findAll();
  }

  @Get('active')
  async findActive(
    @Query('familyId') familyId: string,
  ): Promise<PocketMoneyUser[]> {
    return await this.pocketMoneyUsersService.findActiveByFamilyId(familyId);
  }

  @Get('children/:familyId')
  async getChildrenForFamily(
    @Param('familyId', ParseUUIDPipe) familyId: string,
  ): Promise<PocketMoneyUser[]> {
    return await this.pocketMoneyUsersService.getChildrenForFamily(familyId);
  }

  @Get('validate-name/:familyId/:name')
  async validateChildName(
    @Param('familyId') familyId: string,
    @Param('name') name: string,
    @Query('excludeId') excludeId?: string,
  ): Promise<{ available: boolean }> {
    const available =
      await this.pocketMoneyUsersService.validateChildNameInFamily(
        familyId,
        name,
        excludeId,
      );
    return { available };
  }

  @Get('verify-child-access/:childId/:familyId')
  async verifyChildAccess(
    @Param('childId', ParseUUIDPipe) childId: string,
    @Param('familyId', ParseUUIDPipe) familyId: string,
  ): Promise<{ hasAccess: boolean }> {
    const hasAccess = await this.pocketMoneyUsersService.verifyChildAccess(
      childId,
      familyId,
    );
    return { hasAccess };
  }

  @Get('by-auth-user/:authUserId')
  async findByAuthUserId(
    @Param('authUserId') authUserId: string,
  ): Promise<PocketMoneyUser | null> {
    return await this.pocketMoneyUsersService.findByAuthUserId(authUserId);
  }

  @Get('credentials/:childId')
  @UseGuards(AuthGuard('jwt'), ParentOnlyGuard)
  async getCredentials(
    @Param('childId', ParseUUIDPipe) childId: string,
  ): Promise<{ username: string }> {
    const credentials =
      await this.localAuthService.getChildCredentials(childId);
    if (!credentials) {
      throw new NotFoundException(
        'Ingen loginoplysninger fundet for dette barn',
      );
    }
    return credentials;
  }

  @Post('credentials/:childId/reset-pin')
  @UseGuards(AuthGuard('jwt'), ParentOnlyGuard)
  async resetPin(
    @Param('childId', ParseUUIDPipe) childId: string,
  ): Promise<{ username: string; pin: string }> {
    const result = await this.localAuthService.resetChildPin(childId);
    if (!result) {
      throw new NotFoundException('Ingen barnekonto fundet for dette barn');
    }
    return result;
  }

  @Post('credentials/:childId/create-account')
  @UseGuards(AuthGuard('jwt'), ParentOnlyGuard)
  async createAccountForExistingChild(
    @Param('childId', ParseUUIDPipe) childId: string,
  ): Promise<{ username: string; pin: string }> {
    // Get the child
    const child = await this.pocketMoneyUsersService.findOne(childId);
    if (!child) {
      throw new NotFoundException('Barn ikke fundet');
    }
    if (child.authUserId) {
      throw new NotFoundException('Dette barn har allerede en konto');
    }

    // Get the family name for username generation
    const family = await this.familiesService.findOne(child.familyId);
    const familyName = family?.name || 'familie';

    // Create the auth account
    const result = await this.localAuthService.createChildAccount(
      child.name,
      familyName,
      child.id,
      child.familyId,
    );

    // Link the auth account to the child
    child.authUserId = result.user.id;
    await this.pocketMoneyUsersService.update(child.id, { authUserId: result.user.id } as any);

    return {
      username: result.user.username,
      pin: result.plainPin,
    };
  }

  @Get('child/:id')
  async getChild(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PocketMoneyUser> {
    return await this.pocketMoneyUsersService.findOne(id);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PocketMoneyUser> {
    return await this.pocketMoneyUsersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), ParentOnlyGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdatePocketMoneyUserDto,
  ): Promise<PocketMoneyUser> {
    return await this.pocketMoneyUsersService.update(id, updateUserDto);
  }

  @Patch(':id/balance')
  @UseGuards(AuthGuard('jwt'), ParentOnlyGuard)
  async updateBalance(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('balance') balance: number,
  ): Promise<PocketMoneyUser> {
    return await this.pocketMoneyUsersService.updateBalance(id, balance);
  }

  @Patch(':id/adjust-balance')
  @UseGuards(AuthGuard('jwt'), ParentOnlyGuard)
  async adjustBalance(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('amount') amount: number,
  ): Promise<PocketMoneyUser> {
    return await this.pocketMoneyUsersService.adjustBalance(id, amount);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), ParentOnlyGuard)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return await this.pocketMoneyUsersService.remove(id);
  }
}
