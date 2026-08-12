import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateRewardRuleDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  purchaseCountThreshold?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  spendingThreshold?: number;

  @IsEnum(['DISCOUNT', 'GIFT'])
  rewardType!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  rewardValue?: number;

  @IsOptional()
  @IsString()
  giftDescription?: string;
}
