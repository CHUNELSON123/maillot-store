import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { CommissionRepository } from '../../domain/repositories/commission.repository';
import { InfluencerRepository } from '../../domain/repositories/influencer.repository';
import { WithdrawalRepository } from '../../domain/repositories/withdrawal.repository';
import { WhatsAppNotificationService } from '../../../communications/infrastructure/whatsapp-notification.service';

export interface CreateWithdrawalRequestInput {
  influencerId: string;
  amount: number;
  payoutMethod?: 'MTN' | 'ORANGE';
  payoutPhone?: string;
}

@Injectable()
export class CreateWithdrawalRequestUseCase {
  constructor(
    private readonly influencerRepository: InfluencerRepository,
    private readonly commissionRepository: CommissionRepository,
    private readonly withdrawalRepository: WithdrawalRepository,
    @Optional() private readonly whatsapp?: WhatsAppNotificationService,
  ) {}

  async execute(input: CreateWithdrawalRequestInput) {
    const influencer = await this.influencerRepository.findById(
      input.influencerId,
    );

    if (!influencer) {
      throw new NotFoundException('Influencer not found');
    }

    if (influencer.status !== 'ACTIVE') {
      throw new BadRequestException('Influencer is not active');
    }

    if (input.amount <= 0) {
      throw new BadRequestException(
        'Withdrawal amount must be greater than zero',
      );
    }

    const commissions = await this.commissionRepository.findByInfluencer(
      input.influencerId,
    );

    const approvedCommissionTotal = commissions
      .filter((commission) => commission.status === 'APPROVED')
      .reduce((total, commission) => total + commission.amount, 0);

    const withdrawals = await this.withdrawalRepository.findByInfluencer(
      input.influencerId,
    );

    const reservedWithdrawalTotal = withdrawals
      .filter((withdrawal) =>
        ['PENDING', 'APPROVED', 'PAID'].includes(withdrawal.status),
      )
      .reduce((total, withdrawal) => total + withdrawal.amount, 0);

    const availableBalance = approvedCommissionTotal - reservedWithdrawalTotal;

    if (input.amount > availableBalance) {
      throw new BadRequestException(
        `Insufficient commission balance. Available balance: ${availableBalance}`,
      );
    }

    const withdrawal = await this.withdrawalRepository.create({
      influencerId: input.influencerId,
      amount: input.amount,
      status: 'PENDING',
      payoutMethod: input.payoutMethod,
      payoutPhone: input.payoutPhone,
    });
    const profile = await this.influencerRepository.findProfileByUserId(influencer.userId);
    const adminPhone = process.env.WHATSAPP_ADMIN_PHONE;
    if (adminPhone) {
      try { await this.whatsapp?.notifyAdminWithdrawal(adminPhone, `${profile?.profile.firstName ?? 'Influencer'} ${profile?.profile.lastName ?? ''}`.trim(), `${withdrawal.amount.toLocaleString()} XAF`); }
      catch { /* Withdrawal requests must remain saved if the messaging provider is unavailable. */ }
    }
    return withdrawal;
  }

  async executeForUser(userId: string, amount: number, payoutMethod?: 'MTN' | 'ORANGE', payoutPhone?: string) {
    const influencer = await this.influencerRepository.findByUserId(userId);
    if (!influencer) throw new NotFoundException('Influencer profile not found');
    if (!payoutMethod || !payoutPhone) throw new BadRequestException('Choose a mobile money provider and enter the receiving number');
    return this.execute({ influencerId: influencer.id, amount, payoutMethod, payoutPhone });
  }
}
