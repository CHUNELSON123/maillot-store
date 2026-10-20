import { Injectable, NotFoundException } from '@nestjs/common';
import { InfluencerRepository } from '../../domain/repositories/influencer.repository';
import { WithdrawalRepository } from '../../domain/repositories/withdrawal.repository';

@Injectable()
export class GetInfluencerWithdrawalsUseCase {
  constructor(
    private readonly influencerRepository: InfluencerRepository,
    private readonly withdrawalRepository: WithdrawalRepository,
  ) {}

  async execute(influencerId: string) {
    const influencer = await this.influencerRepository.findById(influencerId);

    if (!influencer) {
      throw new NotFoundException('Influencer not found');
    }

    return this.withdrawalRepository.findByInfluencer(influencerId);
  }

  async executeForUser(userId: string) {
    const influencer = await this.influencerRepository.findByUserId(userId);
    if (!influencer) throw new NotFoundException('Influencer profile not found');
    return this.withdrawalRepository.findByInfluencer(influencer.id);
  }
}
