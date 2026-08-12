import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from '../../../auth/domain/repositories/user.repository';
import { RewardRepository } from '../../domain/repositories/reward.repository';

@Injectable()
export class RedeemRewardUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly rewardRepository: RewardRepository,
  ) {}

  async execute(rewardId: string, userId: string) {
    const customerId = await this.userRepository.findCustomerIdByUserId(userId);

    if (!customerId) {
      throw new NotFoundException('Customer profile not found');
    }

    const reward = await this.rewardRepository.findRewardById(rewardId);

    if (!reward) {
      throw new NotFoundException('Reward not found');
    }

    if (reward.customerId !== customerId) {
      throw new ConflictException(
        "You cannot redeem another customer's reward",
      );
    }

    return this.rewardRepository.redeemReward(rewardId, customerId);
  }
}
