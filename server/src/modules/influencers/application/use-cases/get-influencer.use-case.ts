import { Injectable, NotFoundException } from '@nestjs/common';
import { InfluencerRepository } from '../../domain/repositories/influencer.repository';

@Injectable()
export class GetInfluencerUseCase {
  constructor(private readonly influencerRepository: InfluencerRepository) {}

  async execute(influencerId: string) {
    const influencer = await this.influencerRepository.findById(influencerId);

    if (!influencer) {
      throw new NotFoundException('Influencer not found');
    }

    return influencer;
  }
}
