import { IsNotEmpty, IsUUID } from 'class-validator';

export class AwardRewardDto {
  @IsUUID()
  @IsNotEmpty()
  customerId!: string;

  @IsUUID()
  @IsNotEmpty()
  rewardRuleId!: string;
}
