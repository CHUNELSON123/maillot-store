import { BadRequestException, ConflictException, Injectable, Logger, Optional } from '@nestjs/common';
import { WhatsAppNotificationService } from '../../../communications/infrastructure/whatsapp-notification.service';
import {
  InfluencerRepository,
  UpdateInfluencerData,
} from '../../domain/repositories/influencer.repository';

@Injectable()
export class UpdateInfluencerUseCase {
  private readonly logger = new Logger(UpdateInfluencerUseCase.name);
  constructor(private readonly influencerRepository: InfluencerRepository, @Optional() private readonly whatsapp?: WhatsAppNotificationService) {}

  async execute(influencerId: string, data: UpdateInfluencerData) {
    if (data.status === 'REJECTED') {
      if (!data.rejectionReason?.trim()) throw new BadRequestException('A reason for rejection is required');
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

    const updated = await this.influencerRepository.update(influencerId, { ...data, rejectionReason: data.rejectionReason?.trim() });
    if (data.status === 'REJECTED') {
      const profile = await this.influencerRepository.findProfileByUserId(updated.userId);
      if (profile?.profile.phone) {
        try { await this.whatsapp?.notifyInfluencerRejected(profile.profile.phone, profile.profile.firstName ?? 'Influencer', data.rejectionReason!.trim()); }
        catch (error) { this.logger.warn(`Rejection notification failed: ${String(error)}`); }
      }
    }
    return updated;
  }
}
