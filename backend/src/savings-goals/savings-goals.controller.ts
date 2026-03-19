import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ParentOnlyGuard } from '../auth-proxy/parent-only.guard';
import { SavingsGoalsService } from './savings-goals.service';
import {
  CreateSavingsGoalDto,
  UpdateSavingsGoalDto,
  AddToGoalDto,
} from '../dto/savings-goal.dto';
import { SavingsGoal } from '../entities/savings-goal.entity';

@Controller('savings-goals')
export class SavingsGoalsController {
  constructor(private readonly savingsGoalsService: SavingsGoalsService) {}

  @Post(':childId')
  @UseGuards(AuthGuard('jwt'))
  async create(
    @Param('childId', ParseUUIDPipe) childId: string,
    @Body() createDto: CreateSavingsGoalDto,
  ): Promise<SavingsGoal> {
    return await this.savingsGoalsService.create(childId, createDto);
  }

  @Get(':childId')
  @UseGuards(AuthGuard('jwt'))
  async findByChildId(
    @Param('childId', ParseUUIDPipe) childId: string,
  ): Promise<SavingsGoal[]> {
    return await this.savingsGoalsService.findByChildId(childId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateSavingsGoalDto,
  ): Promise<SavingsGoal> {
    return await this.savingsGoalsService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return await this.savingsGoalsService.delete(id);
  }

  @Post(':id/add')
  @UseGuards(AuthGuard('jwt'), ParentOnlyGuard)
  async addToGoal(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() addDto: AddToGoalDto,
  ): Promise<SavingsGoal> {
    return await this.savingsGoalsService.addToGoal(id, addDto);
  }
}
