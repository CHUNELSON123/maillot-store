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
  referralCode?: string;
  referralAttributionToken?: string;
  paymentMethod: 'mtn' | 'orange' | 'card' | 'cash';

  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  guestAccessToken?: string;

  deliveryMethod: 'DELIVERY' | 'PICKUP';
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryPostalCode?: string;
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

    // Validate delivery details for both guest and registered customers.
    if (
      input.deliveryMethod !== 'DELIVERY' &&
      input.deliveryMethod !== 'PICKUP'
    ) {
      throw new BadRequestException('Invalid delivery method');
    }

    if (
      input.deliveryMethod === 'DELIVERY' &&
      (!input.deliveryAddress?.trim() || !input.deliveryCity?.trim())
    ) {
      throw new BadRequestException(
        'Delivery address and city are required for home delivery',
      );
    }

    let customerId: string | null = null;

    // Registered customer checkout.
    if (input.userId) {
      customerId = await this.userRepository.findCustomerIdByUserId(
        input.userId,
      );

      if (!customerId) {
        throw new NotFoundException('Customer profile not found');
      }
    } else {
      // Guest checkout.
      if (!input.guestName?.trim()) {
        throw new BadRequestException(
          'Guest name is required for guest checkout',
        );
      }

      if (!input.guestEmail?.trim()) {
        throw new BadRequestException(
          'Guest email is required for guest checkout',
        );
      }

      if (!input.guestPhone?.trim()) {
        throw new BadRequestException(
          'Guest phone is required for guest checkout',
        );
      }

      if (!input.guestAccessToken || input.guestAccessToken.length < 64) {
        throw new BadRequestException(
          'A guest order access token is required',
        );
      }
    }

    const orderNumber = `ORD-${Date.now()}`;

    // The repository resolves current product variant prices from the database.
    // Delivery fees are determined by the backend, not the client.
    const deliveryFee = input.deliveryMethod === 'DELIVERY' ? 2000 : 0;

    return this.orderRepository.create({
      customerId,
      guestName: input.guestName?.trim() || null,
      guestEmail: input.guestEmail?.trim() || null,
      guestPhone: input.guestPhone?.trim() || null,
      guestAccessToken: customerId ? null : input.guestAccessToken!,

      orderNumber,
      source: input.source,
      status: 'PENDING',
      totalAmount: 0,
      referralCode: input.referralCode?.trim().toUpperCase() || null,
      referralAttributionToken: input.referralAttributionToken,
      paymentMethod: input.paymentMethod,

      deliveryMethod: input.deliveryMethod,
      deliveryFee,
      deliveryAddress: input.deliveryAddress?.trim() || null,
      deliveryCity: input.deliveryCity?.trim() || null,
      deliveryPostalCode: input.deliveryPostalCode?.trim() || null,

      items: input.items.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice: 0,
      })),
    });
  }
}
