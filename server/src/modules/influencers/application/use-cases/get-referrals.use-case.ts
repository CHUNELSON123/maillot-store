import { Injectable } from '@nestjs/common';
import { InfluencerRepository } from '../../domain/repositories/influencer.repository';

@Injectable()
export class GetReferralsUseCase {
  constructor(private readonly influencerRepository: InfluencerRepository) {}

  async execute(influencerId: string) {
    return this.influencerRepository.findReferralsByInfluencer(influencerId);
  }
}
