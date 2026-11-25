import { ConflictException, Injectable, Optional } from '@nestjs/common';
import { InfluencerRepository } from '../../domain/repositories/influencer.repository';
import { WhatsAppNotificationService } from '../../../communications/infrastructure/whatsapp-notification.service';

@Injectable()
export class ApproveInfluencerUseCase {
  constructor(
    private readonly influencerRepository: InfluencerRepository,
    @Optional() private readonly whatsapp?: WhatsAppNotificationService,
  ) {}

  async execute(influencerId: string) {
    const influencer = await this.influencerRepository.findById(influencerId);

    if (!influencer) {
      throw new ConflictException('Influencer not found');
    }

    if (influencer.status === 'ACTIVE') {
      throw new ConflictException('Influencer is already active');
    }

    if (influencer.status !== 'PENDING') {
      throw new ConflictException('Only pending influencers can be approved');
    }

    const approved = await this.influencerRepository.approve(influencerId);
    const profile = await this.influencerRepository.findProfileByUserId(approved.userId);
    if (profile?.profile.phone) {
      const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:3001';
      const dashboardUrl = `${frontendUrl.replace(/\/$/, '')}/influencer/portal/dashboard`;
      try { await this.whatsapp?.notifyInfluencerApproved(profile.profile.phone, profile.profile.firstName ?? 'Influencer', dashboardUrl); }
      catch { /* Approval must remain successful if the messaging provider is unavailable. */ }
    }
    return approved;
  }
}
