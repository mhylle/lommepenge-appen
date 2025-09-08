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
import { FamiliesService } from './families.service';
import { CreateFamilyDto, UpdateFamilyDto } from '../dto/family.dto';
import { Family } from '../entities/family.entity';

@Controller('families')
export class FamiliesController {
  constructor(private readonly familiesService: FamiliesService) {}

  @Post()
  async create(@Body() createFamilyDto: CreateFamilyDto): Promise<Family> {
    return await this.familiesService.create(createFamilyDto);
  }

  @Get()
  async findAll(@Query('parentUserId') parentUserId?: string): Promise<Family[]> {
    if (parentUserId) {
      return await this.familiesService.findByParentUserId(parentUserId);
    }
    return await this.familiesService.findAll();
  }

  @Get('active')
  async findActive(@Query('parentUserId') parentUserId: string): Promise<Family[]> {
    return await this.familiesService.findActiveByParentUserId(parentUserId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Family> {
    return await this.familiesService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFamilyDto: UpdateFamilyDto,
  ): Promise<Family> {
    return await this.familiesService.update(id, updateFamilyDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return await this.familiesService.remove(id);
  }
}