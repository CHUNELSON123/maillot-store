import { BadRequestException, Injectable } from '@nestjs/common';
import {
  RewardRepository,
  UpdateRewardRuleData,
} from '../../domain/repositories/reward.repository';

@Injectable()
export class UpdateRewardRuleUseCase {
  constructor(private readonly rewardRepository: RewardRepository) {}

  async execute(ruleId: string, data: UpdateRewardRuleData) {
    if (
      data.purchaseCountThreshold !== undefined &&
      data.purchaseCountThreshold <= 0
    ) {
      throw new BadRequestException(
        'Purchase count threshold must be greater than 0',
      );
    }

    if (data.spendingThreshold !== undefined && data.spendingThreshold <= 0) {
      throw new BadRequestException(
        'Spending threshold must be greater than 0',
      );
    }

    if (data.rewardType !== undefined) {
      const rewardType = data.rewardType.toUpperCase();

      if (!['DISCOUNT', 'GIFT'].includes(rewardType)) {
        throw new BadRequestException('Invalid reward type');
      }

      data = {
        ...data,
        rewardType,
      };
    }

    return this.rewardRepository.updateRule(ruleId, data);
  }
}
