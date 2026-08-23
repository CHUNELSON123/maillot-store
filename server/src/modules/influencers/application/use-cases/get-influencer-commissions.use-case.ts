import { Injectable, NotFoundException } from '@nestjs/common';
import { CommissionRepository } from '../../domain/repositories/commission.repository';
import { InfluencerRepository } from '../../domain/repositories/influencer.repository';

@Injectable()
export class GetInfluencerCommissionsUseCase {
  constructor(
    private readonly commissionRepository: CommissionRepository,
    private readonly influencerRepository: InfluencerRepository,
  ) {}

  async execute(influencerId: string) {
    const influencer = await this.influencerRepository.findById(influencerId);

    if (!influencer) {
      throw new NotFoundException('Influencer not found');
    }

    return this.commissionRepository.findByInfluencer(influencerId);
  }
}
