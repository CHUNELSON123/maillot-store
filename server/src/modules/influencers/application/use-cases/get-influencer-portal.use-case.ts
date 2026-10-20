import { Injectable, NotFoundException } from '@nestjs/common';
import { InfluencerRepository } from '../../domain/repositories/influencer.repository';
import { CommissionRepository } from '../../domain/repositories/commission.repository';
import { WithdrawalRepository } from '../../domain/repositories/withdrawal.repository';

@Injectable()
export class GetInfluencerPortalUseCase {
  constructor(
    private readonly influencers: InfluencerRepository,
    private readonly commissions: CommissionRepository,
    private readonly withdrawals: WithdrawalRepository,
  ) {}

  async execute(userId: string) {
    const profile = await this.influencers.findProfileByUserId(userId);
    if (!profile) throw new NotFoundException('Influencer profile not found');
    const [referrals, commissions, withdrawals] = await Promise.all([
      this.influencers.findReferralsByInfluencer(profile.id),
      this.commissions.findByInfluencer(profile.id),
      this.withdrawals.findByInfluencer(profile.id),
    ]);
    const approved = commissions.filter((item) => item.status === 'APPROVED').reduce((sum, item) => sum + item.amount, 0);
    const reserved = withdrawals.filter((item) => ['PENDING', 'APPROVED', 'PAID'].includes(item.status)).reduce((sum, item) => sum + item.amount, 0);
    const now = new Date();
    const activity = Array.from({ length: 7 }, (_, index) => {
      const day = new Date(now);
      day.setHours(0, 0, 0, 0);
      day.setDate(day.getDate() - (6 - index));
      const next = new Date(day);
      next.setDate(next.getDate() + 1);
      const rows = referrals.filter((item) => item.createdAt >= day && item.createdAt < next);
      return {
        date: day.toISOString().slice(0, 10),
        clicks: rows.length,
        orders: rows.filter((item) => item.orderId !== null).length,
        sales: rows.reduce((sum, item) => sum + (item.saleAmount ?? 0), 0),
      };
    });
    return {
      profile,
      referrals,
      commissions,
      withdrawals,
      metrics: {
        clicks: referrals.length,
        orders: referrals.filter((item) => item.orderId !== null).length,
        sales: referrals.reduce((sum, item) => sum + (item.saleAmount ?? 0), 0),
        totalEarnings: commissions.reduce((sum, item) => sum + item.amount, 0),
        pendingEarnings: commissions.filter((item) => item.status === 'PENDING').reduce((sum, item) => sum + item.amount, 0),
        availableBalance: Math.max(0, approved - reserved),
        totalWithdrawn: withdrawals.filter((item) => item.status === 'PAID').reduce((sum, item) => sum + item.amount, 0),
      },
      activity,
    };
  }
}
