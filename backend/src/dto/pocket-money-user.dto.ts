import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDateString,
  MaxLength,
  IsIn,
  IsObject,
  Min,
  Max,
  IsHexColor,
  IsInt,
} from 'class-validator';

export class CreatePocketMoneyUserDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  familyId: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  profilePicture?: string;

  @IsOptional()
  @IsString()
  cardColor?: string;

  @IsOptional()
  @IsNumber()
  weeklyAllowance?: number;

  @IsOptional()
  @IsString()
  authUserId?: string;

  @IsOptional()
  @IsObject()
  preferences?: {
    favoriteStickers?: string[];
    cardStyle?: string;
    notificationSettings?: {
      allowanceReminder: boolean;
      balanceUpdates: boolean;
    };
  };

  @IsOptional()
  @IsString()
  @IsIn(['child', 'teen'])
  role?: string;
}

// Specialized DTO for child registration with Danish validation messages
export class CreateChildDto {
  @IsString({ message: 'Navn skal være tekst' })
  @MaxLength(50, { message: 'Navn må maksimalt være 50 karakterer' })
  name: string;

  @IsString({ message: 'Familie ID er påkrævet' })
  familyId: string;

  @IsInt({ message: 'Alder skal være et helt tal' })
  @Min(3, { message: 'Barn skal være mindst 3 år gammelt' })
  @Max(17, { message: 'Barn må maksimalt være 17 år gammelt' })
  age: number;

  @IsOptional()
  @IsHexColor({
    message: 'Farve skal være en gyldig hex-kode (f.eks. #FF5733)',
  })
  cardColor?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Start balance skal være et tal' })
  @Min(0, { message: 'Start balance kan ikke være negativ' })
  @Max(10000, { message: 'Start balance må maksimalt være 10.000 kr.' })
  initialBalance?: number;

  @IsOptional()
  @IsString()
  profilePicture?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Ugepenge skal være et tal' })
  @Min(0, { message: 'Ugepenge kan ikke være negative' })
  @Max(500, { message: 'Ugepenge må maksimalt være 500 kr.' })
  weeklyAllowance?: number;
}

export class UpdatePocketMoneyUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  profilePicture?: string;

  @IsOptional()
  @IsString()
  cardColor?: string;

  @IsOptional()
  @IsNumber()
  weeklyAllowance?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  authUserId?: string;

  @IsOptional()
  @IsObject()
  preferences?: {
    favoriteStickers?: string[];
    cardStyle?: string;
    notificationSettings?: {
      allowanceReminder: boolean;
      balanceUpdates: boolean;
    };
  };

  @IsOptional()
  @IsString()
  @IsIn(['child', 'teen'])
  role?: string;
}
