import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CreateInfluencerData,
  InfluencerRepository,
} from '../../domain/repositories/influencer.repository';

@Injectable()
export class CreateInfluencerUseCase {
  constructor(private readonly influencerRepository: InfluencerRepository) {}

  async execute(data: CreateInfluencerData) {
    if (!data.referralCode.trim()) {
      throw new BadRequestException('Referral code is required');
    }

    if (data.commissionRate < 0 || data.commissionRate > 100) {
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

    return this.influencerRepository.create({
      ...data,
      referralCode: data.referralCode.trim().toUpperCase(),
    });
  }
}
