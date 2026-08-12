import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateRewardRuleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  purchaseCountThreshold?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  spendingThreshold?: number;

  @IsOptional()
  @IsEnum(['DISCOUNT', 'GIFT'])
  rewardType?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  rewardValue?: number;

  @IsOptional()
  @IsString()
  giftDescription?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
