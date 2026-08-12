import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from '../../../auth/domain/repositories/user.repository';
import { OrderRepository } from '../../domain/repositories/order.repository';

export interface CreateOrderItemInput {
  variantId: string;
  quantity: number;
}

export interface CreateOrderInput {
  userId: string;
  source: string;
  items: CreateOrderItemInput[];
  influencerDiscountAmount?: number;
}

@Injectable()
export class CreateOrderUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly orderRepository: OrderRepository,
  ) {}

  async execute(input: CreateOrderInput) {
    const customerId = await this.userRepository.findCustomerIdByUserId(
      input.userId,
    );

    if (!customerId) {
      throw new NotFoundException('Customer profile not found');
    }

    if (!input.items.length) {
      throw new BadRequestException('Order must contain at least one item');
    }

    const orderNumber = `ORD-${Date.now()}`;

    // Pricing will be resolved by the repository from the
    // current ProductVariant prices.
    return this.orderRepository.create({
      customerId,
      orderNumber,
      source: input.source,
      status: 'PENDING',
      totalAmount: 0,
      influencerDiscountAmount: input.influencerDiscountAmount ?? 0,
      items: input.items.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: 0,
      })),
    });
  }
}
