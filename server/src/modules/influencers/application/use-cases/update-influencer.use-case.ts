import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import {
  InfluencerRepository,
  UpdateInfluencerData,
} from '../../domain/repositories/influencer.repository';

@Injectable()
export class UpdateInfluencerUseCase {
  constructor(private readonly influencerRepository: InfluencerRepository) {}

  async execute(influencerId: string, data: UpdateInfluencerData) {
    if (data.status === 'REJECTED') {
      const influencer = await this.influencerRepository.findById(influencerId);
      if (!influencer) throw new ConflictException('Influencer not found');
      if (influencer.status !== 'PENDING') {
        throw new ConflictException('Only pending applications can be rejected');
      }
    }
    if (
      data.commissionRate !== undefined &&
      (data.commissionRate < 0 || data.commissionRate > 100)
    ) {
      throw new BadRequestException(
        'Commission rate must be between 0 and 100',
      );
    }

    if (
      data.customerDiscountRate !== undefined &&
      (data.customerDiscountRate < 0 || data.customerDiscountRate > 100)
    ) {
      throw new BadRequestException(
        'Customer discount rate must be between 0 and 100',
      );
    }

    if (data.referralCode !== undefined) {
      const referralCode = data.referralCode.trim().toUpperCase();

      if (!referralCode) {
        throw new BadRequestException('Referral code cannot be empty');
      }

      data = {
        ...data,
        referralCode,
      };
    }

    return this.influencerRepository.update(influencerId, data);
  }
}
