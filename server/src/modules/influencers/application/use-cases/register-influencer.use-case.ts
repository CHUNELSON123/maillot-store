import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InfluencerRepository } from '../../domain/repositories/influencer.repository';

export interface RegisterInfluencerInput {
  existingUserId?: string;
  email: string;
  password?: string;
  firstName: string; lastName: string; phone: string; country: string;
  dateOfBirth: Date; gender: string; city: string; occupation: string;
  bio: string; applicationNote: string; instagramUrl?: string; tiktokUrl?: string;
  youtubeUrl?: string; facebookUrl?: string; xUrl?: string; termsAcceptedAt: Date;
}

@Injectable()
export class RegisterInfluencerUseCase {
  constructor(private readonly influencerRepository: InfluencerRepository) {}

  async execute(input: RegisterInfluencerInput) {
    if (!input.existingUserId && (!input.password || input.password.length < 8)) {
      throw new BadRequestException('Password must be at least 8 characters for a new account');
    }

    const socialLinks = [input.instagramUrl, input.tiktokUrl, input.youtubeUrl, input.facebookUrl, input.xUrl];
    if (!socialLinks.some((link) => link?.trim())) {
      throw new BadRequestException('Add at least one social media profile link');
    }

    const passwordHash = input.password ? await bcrypt.hash(input.password, 12) : undefined;

    const referralCode = await this.generateUniqueReferralCode();

    return this.influencerRepository.register({
      userId: input.existingUserId,
      email: input.email,
      passwordHash,
      referralCode,
      status: 'PENDING',
      commissionRate: 0,
      customerDiscountRate: 0,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      phone: input.phone.trim(),
      country: input.country.trim(),
      dateOfBirth: input.dateOfBirth,
      gender: input.gender,
      city: input.city.trim(),
      occupation: input.occupation.trim(),
      bio: input.bio.trim(),
      applicationNote: input.applicationNote.trim(),
      instagramUrl: input.instagramUrl,
      tiktokUrl: input.tiktokUrl,
      youtubeUrl: input.youtubeUrl,
      facebookUrl: input.facebookUrl,
      xUrl: input.xUrl,
      termsAcceptedAt: input.termsAcceptedAt,
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
