import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  MaxLength,
  IsIn,
} from 'class-validator';

export class CreateFamilyDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsString()
  parentUserId: string;

  @IsOptional()
  @IsString()
  profilePicture?: string;

  @IsOptional()
  @IsString()
  @IsIn(['DKK', 'EUR', 'USD', 'SEK', 'NOK'])
  currency?: string;

  @IsOptional()
  @IsNumber()
  defaultAllowance?: number;

  @IsOptional()
  @IsString()
  @IsIn(['weekly', 'monthly', 'biweekly'])
  allowanceFrequency?: string;
}

export class UpdateFamilyDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  profilePicture?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['DKK', 'EUR', 'USD', 'SEK', 'NOK'])
  currency?: string;

  @IsOptional()
  @IsNumber()
  defaultAllowance?: number;

  @IsOptional()
  @IsString()
  @IsIn(['weekly', 'monthly', 'biweekly'])
  allowanceFrequency?: string;
}
