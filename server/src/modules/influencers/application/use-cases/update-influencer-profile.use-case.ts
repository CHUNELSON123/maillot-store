import { BadRequestException, Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InfluencerRepository, UpdateInfluencerProfileData } from '../../domain/repositories/influencer.repository';

@Injectable()
export class UpdateInfluencerProfileUseCase {
  constructor(private readonly influencers: InfluencerRepository) {}

  async execute(userId: string, data: UpdateInfluencerProfileData) {
    if (data.email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      throw new BadRequestException('Enter a valid email address');
    }
    try {
      return await this.influencers.updateProfileByUserId(userId, data);
    } catch (error) {
      if ((error as { code?: string }).code === 'P2002') {
        throw new ConflictException('That email address is already in use');
      }
      if ((error as { status?: number }).status) throw error;
      throw new NotFoundException('Influencer profile could not be updated');
    }
  }
}
