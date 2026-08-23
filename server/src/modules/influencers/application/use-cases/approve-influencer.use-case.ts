import { ConflictException, Injectable } from '@nestjs/common';
import { InfluencerRepository } from '../../domain/repositories/influencer.repository';

@Injectable()
export class ApproveInfluencerUseCase {
  constructor(private readonly influencerRepository: InfluencerRepository) {}

  async execute(influencerId: string) {
    const influencer = await this.influencerRepository.findById(influencerId);

    if (!influencer) {
      throw new ConflictException('Influencer not found');
    }

    if (influencer.status === 'ACTIVE') {
      throw new ConflictException('Influencer is already active');
    }

    if (influencer.status !== 'PENDING') {
      throw new ConflictException('Only pending influencers can be approved');
    }

    return this.influencerRepository.approve(influencerId);
  }
}
