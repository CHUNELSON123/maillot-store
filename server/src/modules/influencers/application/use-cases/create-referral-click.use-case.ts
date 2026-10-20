import { Injectable, BadRequestException } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import { InfluencerRepository } from '../../domain/repositories/influencer.repository';

@Injectable()
export class CreateReferralClickUseCase {
  constructor(private readonly influencers: InfluencerRepository) {}

  async execute(code: string) {
    const referralCode = code.trim().toUpperCase();
    if (!/^[A-Z0-9-]{3,64}$/.test(referralCode)) {
      throw new BadRequestException('Invalid referral code');
    }
    const token = randomBytes(32).toString('hex');
    await this.influencers.createReferralClick(
      referralCode,
      createHash('sha256').update(token).digest('hex'),
    );
    return { attributionToken: token };
  }
}
