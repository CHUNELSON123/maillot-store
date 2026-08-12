import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InfluencerRepository } from '../../domain/repositories/influencer.repository';

export interface RegisterInfluencerInput {
  email: string;
  password: string;
}

@Injectable()
export class RegisterInfluencerUseCase {
  constructor(private readonly influencerRepository: InfluencerRepository) {}

  async execute(input: RegisterInfluencerInput) {
    if (input.password.length < 8) {
      throw new ConflictException('Password must be at least 8 characters');
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    const referralCode = await this.generateUniqueReferralCode();

    return this.influencerRepository.register({
      email: input.email,
      passwordHash,
      referralCode,
      status: 'PENDING',
      commissionRate: 0,
      customerDiscountRate: 0,
    });
  }

  private async generateUniqueReferralCode(): Promise<string> {
    for (let attempt = 0; attempt < 10; attempt++) {
      const code = `INF-${Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase()}`;

      const exists = await this.influencerRepository.referralCodeExists(code);

      if (!exists) {
        return code;
      }
    }

    throw new ConflictException('Unable to generate a unique referral code');
  }
}
