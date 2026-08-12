import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateInfluencerDto {
  @IsOptional()
  @IsString()
  referralCode?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  commissionRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  customerDiscountRate?: number;
}
