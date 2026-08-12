import { Injectable } from '@nestjs/common';
import { RewardRepository } from '../../domain/repositories/reward.repository';

@Injectable()
export class GetRewardRulesUseCase {
  constructor(private readonly rewardRepository: RewardRepository) {}

  async execute() {
    return this.rewardRepository.findRules();
  }
}
