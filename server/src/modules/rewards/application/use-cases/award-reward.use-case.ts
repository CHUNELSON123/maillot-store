import { BadRequestException, Injectable } from '@nestjs/common';
import {
  AwardRewardData,
  RewardRepository,
} from '../../domain/repositories/reward.repository';

@Injectable()
export class AwardRewardUseCase {
  constructor(private readonly rewardRepository: RewardRepository) {}

  async execute(data: AwardRewardData) {
    if (!data.customerId || !data.rewardRuleId) {
      throw new BadRequestException(
        'Customer ID and reward rule ID are required',
      );
    }

    return this.rewardRepository.awardReward(data);
  }
}
