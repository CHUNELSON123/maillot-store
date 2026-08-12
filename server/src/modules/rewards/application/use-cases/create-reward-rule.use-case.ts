import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CreateRewardRuleData,
  RewardRepository,
} from '../../domain/repositories/reward.repository';

@Injectable()
export class CreateRewardRuleUseCase {
  constructor(private readonly rewardRepository: RewardRepository) {}

  async execute(data: CreateRewardRuleData) {
    if (
      data.purchaseCountThreshold === undefined &&
      data.spendingThreshold === undefined
    ) {
      throw new BadRequestException(
        'At least one reward threshold is required',
      );
    }

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

    return this.rewardRepository.createRule(data);
  }
}
