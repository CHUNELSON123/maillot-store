import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommissionRepository } from '../../domain/repositories/commission.repository';
import { InfluencerRepository } from '../../domain/repositories/influencer.repository';
import { WithdrawalRepository } from '../../domain/repositories/withdrawal.repository';

export interface CreateWithdrawalRequestInput {
  influencerId: string;
  amount: number;
}

@Injectable()
export class CreateWithdrawalRequestUseCase {
  constructor(
    private readonly influencerRepository: InfluencerRepository,
    private readonly commissionRepository: CommissionRepository,
    private readonly withdrawalRepository: WithdrawalRepository,
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

    return this.withdrawalRepository.create({
      influencerId: input.influencerId,
      amount: input.amount,
      status: 'PENDING',
    });
  }
}
