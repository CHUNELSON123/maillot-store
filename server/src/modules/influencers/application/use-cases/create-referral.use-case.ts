import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CreateReferralData,
  InfluencerRepository,
} from '../../domain/repositories/influencer.repository';

@Injectable()
export class CreateReferralUseCase {
  constructor(private readonly influencerRepository: InfluencerRepository) {}

  async execute(data: CreateReferralData) {
    const referralCode = data.referralCode.trim().toUpperCase();

    if (!referralCode) {
      throw new BadRequestException('Referral code is required');
    }

    return this.influencerRepository.createReferral({
      ...data,
      referralCode,
      status: data.status.toUpperCase(),
    });
  }
}
