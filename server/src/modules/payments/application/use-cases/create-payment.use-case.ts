import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from '../../../auth/domain/repositories/user.repository';
import { PaymentRepository } from '../../domain/repositories/payment.repository';

export interface CreatePaymentInput {
  userId: string;
  orderId: string;
  paymentMethodId: string;
  transactionReference?: string;
}

@Injectable()
export class CreatePaymentUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly paymentRepository: PaymentRepository,
  ) {}

  async execute(input: CreatePaymentInput) {
    const customerId = await this.userRepository.findCustomerIdByUserId(
      input.userId,
    );

    if (!customerId) {
      throw new NotFoundException('Customer profile not found');
    }

    if (
      input.transactionReference !== undefined &&
      input.transactionReference.trim() === ''
    ) {
      throw new BadRequestException('Transaction reference cannot be empty');
    }

    return this.paymentRepository.create({
      orderId: input.orderId,
      customerId,
      paymentMethodId: input.paymentMethodId,
      transactionReference: input.transactionReference,
    });
  }
}
