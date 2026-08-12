import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../../auth/domain/repositories/user.repository';
import { RewardRepository } from '../../domain/repositories/reward.repository';

@Injectable()
export class GetCustomerRewardsUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly rewardRepository: RewardRepository,
  ) {}

  async execute(userId: string) {
    const customerId = await this.userRepository.findCustomerIdByUserId(userId);

    if (!customerId) {
      throw new NotFoundException('Customer profile not found');
    }

    return this.rewardRepository.findCustomerRewards(customerId);
  }
}
