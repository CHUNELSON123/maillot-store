import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { notifyAdministrators } from '../../../../infrastructure/database/admin-notifications';
import { notifyInfluencer } from '../../../../infrastructure/database/influencer-notifications';
import { WithdrawalRequestEntity } from '../../domain/entities/withdrawal-request.entity';
import {
  CreateWithdrawalData,
  UpdateWithdrawalData,
  WithdrawalRepository,
} from '../../domain/repositories/withdrawal.repository';

@Injectable()
export class PrismaWithdrawalRepository implements WithdrawalRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getMinimumWithdrawalAmount(): Promise<number> {
    const setting = await this.prisma.systemSetting.findFirst({
      where: { key: 'influencer_minimum_withdrawal_amount', deleted_at: null },
      select: { value: true },
    });
    const amount = Number(setting?.value ?? 0);
    return Number.isFinite(amount) && amount > 0 ? amount : 0;
  }

  async create(data: CreateWithdrawalData): Promise<WithdrawalRequestEntity> {
    if (!Number.isFinite(data.amount) || data.amount <= 0) {
      throw new BadRequestException('Withdrawal amount must be greater than zero');
    }

    const withdrawal = await this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw<{ id: string }[]>`SELECT "id" FROM "influencers" WHERE "id" = ${data.influencerId}::uuid FOR UPDATE`;
      const influencer = await tx.influencer.findFirst({
        where: { id: data.influencerId, deleted_at: null },
      });
      if (!influencer) throw new NotFoundException('Influencer not found');
      if (influencer.status !== 'ACTIVE') {
        throw new ConflictException('Influencer is not active');
      }

      const setting = await tx.systemSetting.findFirst({
        where: { key: 'influencer_minimum_withdrawal_amount', deleted_at: null },
        select: { value: true },
      });
      const minimum = Number(setting?.value ?? 0);
      if (Number.isFinite(minimum) && minimum > 0 && data.amount < minimum) {
        throw new BadRequestException(`The minimum withdrawal request is ${minimum} XAF`);
      }

      const [commissionTotals, withdrawalTotals] = await Promise.all([
        tx.commission.aggregate({
          where: { influencer_id: data.influencerId, status: 'APPROVED', deleted_at: null },
          _sum: { amount: true },
        }),
        tx.withdrawalRequest.aggregate({
          where: { influencer_id: data.influencerId, status: { in: ['PENDING', 'APPROVED', 'PAID'] }, deleted_at: null },
          _sum: { amount: true },
        }),
      ]);
      const available = Number(commissionTotals._sum.amount ?? 0) - Number(withdrawalTotals._sum.amount ?? 0);
      if (data.amount > available) {
        throw new BadRequestException(`Insufficient commission balance. Available balance: ${Math.max(0, available)}`);
      }

      const request = await tx.withdrawalRequest.create({
        data: {
          influencer_id: data.influencerId,
          amount: data.amount,
          status: data.status,
          payout_method: data.payoutMethod,
          payout_phone: data.payoutPhone,
        },
      });
      await notifyAdministrators(tx, { title: 'Withdrawal request', message: `A withdrawal of ${data.amount.toLocaleString()} XAF requires review.`, type: 'WITHDRAWAL', targetUrl: `/admin/influencers?influencer=${encodeURIComponent(data.influencerId)}#withdrawal-requests` });
      return request;
    });

    return this.toEntity(withdrawal);
  }

  async findById(
    withdrawalId: string,
  ): Promise<WithdrawalRequestEntity | null> {
    const withdrawal = await this.prisma.withdrawalRequest.findFirst({
      where: {
        id: withdrawalId,
        deleted_at: null,
      },
    });

    if (!withdrawal) {
      return null;
    }

    return this.toEntity(withdrawal);
  }

  async findByInfluencer(
    influencerId: string,
  ): Promise<WithdrawalRequestEntity[]> {
    const withdrawals = await this.prisma.withdrawalRequest.findMany({
      where: {
        influencer_id: influencerId,
        deleted_at: null,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return withdrawals.map((withdrawal) => this.toEntity(withdrawal));
  }

  async updateStatus(
    withdrawalId: string,
    data: UpdateWithdrawalData,
  ): Promise<WithdrawalRequestEntity> {
    const existing = await this.prisma.withdrawalRequest.findFirst({
      where: {
        id: withdrawalId,
        deleted_at: null,
      },
    });

    if (!existing) {
      throw new NotFoundException('Withdrawal request not found');
    }

    const withdrawal = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.withdrawalRequest.update({
      where: {
        id: withdrawalId,
      },
      data: {
        status: data.status,
        ...(data.paymentReference !== undefined && {
          payment_reference: data.paymentReference,
        }),
        ...(data.processedAt !== undefined && {
          processed_at: data.processedAt,
        }),
      },
      });
      if (existing.status !== data.status && ['APPROVED', 'REJECTED', 'PAID'].includes(data.status)) {
        const influencer = await tx.influencer.findFirstOrThrow({ where: { id: updated.influencer_id, deleted_at: null }, select: { user_id: true } });
        const descriptions: Record<string, string> = {
          APPROVED: 'Your withdrawal request was approved and is awaiting payment.',
          REJECTED: 'Your withdrawal request was rejected. Its reserved amount is available again.',
          PAID: 'Your withdrawal has been recorded as paid.',
        };
        const tab = data.status === 'APPROVED' ? 'requests' : 'history';
        await notifyInfluencer(tx, influencer.user_id, { title: `Withdrawal ${data.status.toLowerCase()}`, message: `${descriptions[data.status]} Amount: ${Number(updated.amount).toLocaleString()} XAF.`, type: 'WITHDRAWAL', targetUrl: `/influencer/portal/earnings?tab=${tab}` });
      }
      return updated;
    });

    return this.toEntity(withdrawal);
  }

  private toEntity(withdrawal: {
    id: string;
    influencer_id: string;
    amount: unknown;
    status: string;
    payment_reference: string | null;
    processed_at: Date | null;
    created_at: Date;
    updated_at: Date;
    payout_method: string | null;
    payout_phone: string | null;
  }): WithdrawalRequestEntity {
    return new WithdrawalRequestEntity(
      withdrawal.id,
      withdrawal.influencer_id,
      Number(withdrawal.amount),
      withdrawal.status,
      withdrawal.payment_reference,
      withdrawal.processed_at,
      withdrawal.created_at,
      withdrawal.updated_at,
      withdrawal.payout_method,
      withdrawal.payout_phone,
    );
  }
}
