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
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ParentOnlyGuard } from '../auth-proxy/parent-only.guard';
import { FamiliesService } from './families.service';
import { CreateFamilyDto, UpdateFamilyDto } from '../dto/family.dto';
import { Family } from '../entities/family.entity';

@Controller('families')
export class FamiliesController {
  constructor(private readonly familiesService: FamiliesService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), ParentOnlyGuard)
  async create(@Body() createFamilyDto: CreateFamilyDto): Promise<Family> {
    return await this.familiesService.create(createFamilyDto);
  }

  @Get()
  async findAll(
    @Query('parentUserId') parentUserId?: string,
  ): Promise<Family[]> {
    if (parentUserId) {
      return await this.familiesService.findByParentUserId(parentUserId);
    }
    return await this.familiesService.findAll();
  }

  @Get('active')
  async findActive(
    @Query('parentUserId') parentUserId: string,
  ): Promise<Family[]> {
    return await this.familiesService.findActiveByParentUserId(parentUserId);
  }

  @Get('debug/schema')
  async debugSchema(): Promise<any> {
    return await this.familiesService.debugDatabaseSchema();
  }

  @Get('debug/active')
  async debugActive(@Query('parentUserId') parentUserId: string): Promise<any> {
    return await this.familiesService.debugActiveByParentUserId(parentUserId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Family> {
    return await this.familiesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), ParentOnlyGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFamilyDto: UpdateFamilyDto,
  ): Promise<Family> {
    return await this.familiesService.update(id, updateFamilyDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), ParentOnlyGuard)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return await this.familiesService.remove(id);
  }
}
