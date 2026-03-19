import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavingsGoal } from '../entities/savings-goal.entity';
import { PocketMoneyUser } from '../entities/pocket-money-user.entity';
import {
  CreateSavingsGoalDto,
  UpdateSavingsGoalDto,
  AddToGoalDto,
} from '../dto/savings-goal.dto';

@Injectable()
export class SavingsGoalsService {
  constructor(
    @InjectRepository(SavingsGoal)
    private savingsGoalRepository: Repository<SavingsGoal>,
    @InjectRepository(PocketMoneyUser)
    private pocketMoneyUsersRepository: Repository<PocketMoneyUser>,
  ) {}

  async create(
    childId: string,
    createDto: CreateSavingsGoalDto,
  ): Promise<SavingsGoal> {
    // Verify the child exists
    const child = await this.pocketMoneyUsersRepository.findOne({
      where: { id: childId },
    });

    if (!child) {
      throw new NotFoundException(
        `Barn med ID "${childId}" blev ikke fundet`,
      );
    }

    const goal = this.savingsGoalRepository.create({
      childId,
      name: createDto.name,
      targetAmount: createDto.targetAmount,
      emoji: createDto.emoji || '🎯',
      priority: createDto.priority || undefined,
    });

    return await this.savingsGoalRepository.save(goal);
  }

  async findByChildId(childId: string): Promise<SavingsGoal[]> {
    return await this.savingsGoalRepository.find({
      where: { childId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<SavingsGoal> {
    const goal = await this.savingsGoalRepository.findOne({
      where: { id },
    });

    if (!goal) {
      throw new NotFoundException(`Opsparingsmål med ID "${id}" blev ikke fundet`);
    }

    return goal;
  }

  async update(
    id: string,
    updateDto: UpdateSavingsGoalDto,
  ): Promise<SavingsGoal> {
    const goal = await this.findOne(id);

    Object.assign(goal, updateDto);

    // Auto-complete if currentAmount >= targetAmount
    if (
      goal.currentAmount !== undefined &&
      goal.targetAmount !== undefined &&
      Number(goal.currentAmount) >= Number(goal.targetAmount)
    ) {
      goal.isCompleted = true;
    }

    return await this.savingsGoalRepository.save(goal);
  }

  async delete(id: string): Promise<void> {
    const goal = await this.findOne(id);
    await this.savingsGoalRepository.remove(goal);
  }

  async addToGoal(id: string, addDto: AddToGoalDto): Promise<SavingsGoal> {
    const goal = await this.findOne(id);

    if (goal.isCompleted) {
      throw new BadRequestException('Dette mål er allerede nået');
    }

    goal.currentAmount = Number(goal.currentAmount) + Number(addDto.amount);

    // Auto-complete if target reached
    if (Number(goal.currentAmount) >= Number(goal.targetAmount)) {
      goal.isCompleted = true;
    }

    return await this.savingsGoalRepository.save(goal);
  }
}
