import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateInfluencerDto {
  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  referralCode!: string;

  @IsString()
  @IsNotEmpty()
  status!: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  commissionRate!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  customerDiscountRate?: number;
}
