import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../../auth/domain/repositories/user.repository';
import { PaymentRepository } from '../../domain/repositories/payment.repository';

@Injectable()
export class GetPaymentUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly paymentRepository: PaymentRepository,
  ) {}

  async execute(userId: string, orderId: string) {
    const customerId = await this.userRepository.findCustomerIdByUserId(userId);

    if (!customerId) {
      throw new NotFoundException('Customer profile not found');
    }

    const payment = await this.paymentRepository.findByOrderId(
      orderId,
      customerId,
    );

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }
}
