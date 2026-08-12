import { BadRequestException, Injectable } from '@nestjs/common';
import { PaymentRepository } from '../../domain/repositories/payment.repository';

export interface UpdatePaymentStatusInput {
  status: string;
  transactionReference?: string;
}

@Injectable()
export class UpdatePaymentStatusUseCase {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async execute(paymentId: string, input: UpdatePaymentStatusInput) {
    const status = input.status.toUpperCase();

    const allowedStatuses = ['PENDING', 'PAID', 'FAILED', 'CANCELLED'];

    if (!allowedStatuses.includes(status)) {
      throw new BadRequestException('Invalid payment status');
    }

    return this.paymentRepository.updateStatus(paymentId, {
      status,
      transactionReference: input.transactionReference,
    });
  }
}
