import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WithdrawalRepository } from '../../domain/repositories/withdrawal.repository';

export interface UpdateWithdrawalStatusInput {
  status: string;
  paymentReference?: string;
}

@Injectable()
export class UpdateWithdrawalStatusUseCase {
  constructor(private readonly withdrawalRepository: WithdrawalRepository) {}

  async execute(withdrawalId: string, input: UpdateWithdrawalStatusInput) {
    const withdrawal = await this.withdrawalRepository.findById(withdrawalId);

    if (!withdrawal) {
      throw new NotFoundException('Withdrawal request not found');
    }

    const status = input.status.trim().toUpperCase();

    const allowedStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'PAID'];

    if (!allowedStatuses.includes(status)) {
      throw new BadRequestException('Invalid withdrawal status');
    }

    if (withdrawal.status === 'PAID' || withdrawal.status === 'REJECTED') {
      throw new BadRequestException(
        `Withdrawal is already ${withdrawal.status}`,
      );
    }

    if (status === 'PAID' && withdrawal.status !== 'APPROVED') {
      throw new BadRequestException(
        'Only an approved withdrawal can be marked as paid',
      );
    }

    if (status === 'PAID' && !input.paymentReference?.trim()) {
      throw new BadRequestException(
        'Payment reference is required when marking a withdrawal as paid',
      );
    }

    return this.withdrawalRepository.updateStatus(withdrawalId, {
      status,
      ...(input.paymentReference !== undefined && {
        paymentReference: input.paymentReference.trim(),
      }),
      ...(status === 'PAID' && {
        processedAt: new Date(),
      }),
    });
  }
}
