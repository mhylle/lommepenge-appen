import { IsString, IsOptional, IsNumber, IsEnum, IsDateString, IsObject, MaxLength } from 'class-validator';
import { TransactionType, TransactionStatus } from '../entities';

export class CreateTransactionDto {
  @IsString()
  userId: string;

  @IsString()
  familyId: string;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @IsOptional()
  @IsString()
  stickerType?: string;

  @IsOptional()
  @IsString()
  stickerColor?: string;

  @IsOptional()
  @IsObject()
  metadata?: {
    choreDetails?: {
      choreName: string;
      completedAt: Date;
      difficulty: 'easy' | 'medium' | 'hard';
    };
    purchaseDetails?: {
      itemName: string;
      store?: string;
      receipt?: string;
    };
    allowanceDetails?: {
      weekStarting: Date;
      weekEnding: Date;
      isRegular: boolean;
    };
    transferDetails?: {
      fromUserId?: string;
      toUserId?: string;
      reason: string;
    };
  };

  @IsString()
  createdByUserId: string;

  @IsOptional()
  @IsDateString()
  transactionDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  notes?: string;
}

export class UpdateTransactionDto {
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @IsOptional()
  @IsString()
  stickerType?: string;

  @IsOptional()
  @IsString()
  stickerColor?: string;

  @IsOptional()
  @IsObject()
  metadata?: any;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  notes?: string;
}