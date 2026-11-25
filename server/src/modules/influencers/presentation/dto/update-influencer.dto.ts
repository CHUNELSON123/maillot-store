import { IsIn, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class UpdateInfluencerDto {
  @IsOptional()
  @IsIn(['REJECTED'])
  status?: 'REJECTED';

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  rejectionReason?: string;

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
