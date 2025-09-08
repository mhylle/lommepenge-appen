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
} from '@nestjs/common';
import { PocketMoneyUsersService } from './pocket-money-users.service';
import { CreatePocketMoneyUserDto, CreateChildDto, UpdatePocketMoneyUserDto } from '../dto/pocket-money-user.dto';
import { PocketMoneyUser } from '../entities/pocket-money-user.entity';

@Controller('pocket-money-users')
export class PocketMoneyUsersController {
  constructor(private readonly pocketMoneyUsersService: PocketMoneyUsersService) {}

  @Post()
  async create(@Body() createUserDto: CreatePocketMoneyUserDto): Promise<PocketMoneyUser> {
    return await this.pocketMoneyUsersService.create(createUserDto);
  }

  @Post('children')
  async createChild(@Body() createChildDto: CreateChildDto): Promise<PocketMoneyUser> {
    return await this.pocketMoneyUsersService.createChild(createChildDto);
  }

  @Get()
  async findAll(@Query('familyId') familyId?: string): Promise<PocketMoneyUser[]> {
    if (familyId) {
      return await this.pocketMoneyUsersService.findByFamilyId(familyId);
    }
    return await this.pocketMoneyUsersService.findAll();
  }

  @Get('active')
  async findActive(@Query('familyId') familyId: string): Promise<PocketMoneyUser[]> {
    return await this.pocketMoneyUsersService.findActiveByFamilyId(familyId);
  }

  @Get('children/:familyId')
  async getChildrenForFamily(@Param('familyId', ParseUUIDPipe) familyId: string): Promise<PocketMoneyUser[]> {
    return await this.pocketMoneyUsersService.getChildrenForFamily(familyId);
  }

  @Get('validate-name/:familyId/:name')
  async validateChildName(
    @Param('familyId') familyId: string,
    @Param('name') name: string,
    @Query('excludeId') excludeId?: string
  ): Promise<{ available: boolean }> {
    const available = await this.pocketMoneyUsersService.validateChildNameInFamily(familyId, name, excludeId);
    return { available };
  }

  @Get('by-auth-user/:authUserId')
  async findByAuthUserId(@Param('authUserId') authUserId: string): Promise<PocketMoneyUser | null> {
    return await this.pocketMoneyUsersService.findByAuthUserId(authUserId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<PocketMoneyUser> {
    return await this.pocketMoneyUsersService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdatePocketMoneyUserDto,
  ): Promise<PocketMoneyUser> {
    return await this.pocketMoneyUsersService.update(id, updateUserDto);
  }

  @Patch(':id/balance')
  async updateBalance(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('balance') balance: number,
  ): Promise<PocketMoneyUser> {
    return await this.pocketMoneyUsersService.updateBalance(id, balance);
  }

  @Patch(':id/adjust-balance')
  async adjustBalance(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('amount') amount: number,
  ): Promise<PocketMoneyUser> {
    return await this.pocketMoneyUsersService.adjustBalance(id, amount);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return await this.pocketMoneyUsersService.remove(id);
  }
}