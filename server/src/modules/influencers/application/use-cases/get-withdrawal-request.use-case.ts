import { Injectable, NotFoundException } from '@nestjs/common';
import { WithdrawalRepository } from '../../domain/repositories/withdrawal.repository';

@Injectable()
export class GetWithdrawalRequestUseCase {
  constructor(private readonly withdrawalRepository: WithdrawalRepository) {}

  async execute(withdrawalId: string) {
    const withdrawal = await this.withdrawalRepository.findById(withdrawalId);

    if (!withdrawal) {
      throw new NotFoundException('Withdrawal request not found');
    }

    return withdrawal;
  }
}
