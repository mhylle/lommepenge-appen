import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsBoolean,
  MaxLength,
  Min,
} from 'class-validator';
import { SavingsGoalPriority } from '../entities/savings-goal.entity';

export class CreateSavingsGoalDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsNumber()
  @Min(1)
  targetAmount: number;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  emoji?: string;

  @IsOptional()
  @IsEnum(SavingsGoalPriority)
  priority?: SavingsGoalPriority;
}

export class UpdateSavingsGoalDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  targetAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  currentAmount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  emoji?: string;

  @IsOptional()
  @IsEnum(SavingsGoalPriority)
  priority?: SavingsGoalPriority;

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}

export class AddToGoalDto {
  @IsNumber()
  @Min(0.01)
  amount: number;
}
