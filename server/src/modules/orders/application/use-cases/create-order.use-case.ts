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
  userId?: string;
  source: string;
  items: CreateOrderItemInput[];
  influencerDiscountAmount?: number;

  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
}

@Injectable()
export class CreateOrderUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly orderRepository: OrderRepository,
  ) {}

  async execute(input: CreateOrderInput) {
    if (!input.items.length) {
      throw new BadRequestException('Order must contain at least one item');
    }

    let customerId: string | null = null;

    // Logged-in customer
    if (input.userId) {
      customerId = await this.userRepository.findCustomerIdByUserId(
        input.userId,
      );

      if (!customerId) {
        throw new NotFoundException('Customer profile not found');
      }
    } else {
      // Guest checkout
      if (!input.guestName) {
        throw new BadRequestException(
          'Guest name is required for guest checkout',
        );
      }

      if (!input.guestEmail) {
        throw new BadRequestException(
          'Guest email is required for guest checkout',
        );
      }

      if (!input.guestPhone) {
        throw new BadRequestException(
          'Guest phone is required for guest checkout',
        );
      }
    }

    const orderNumber = `ORD-${Date.now()}`;

    // Pricing will be resolved by the repository from the
    // current ProductVariant prices.
    return this.orderRepository.create({
      customerId,
      guestName: input.guestName ?? null,
      guestEmail: input.guestEmail ?? null,
      guestPhone: input.guestPhone ?? null,
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
