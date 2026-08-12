import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderRepository } from '../../domain/repositories/order.repository';

export interface UpdateOrderStatusInput {
  status: string;
}

@Injectable()
export class UpdateOrderStatusUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(orderId: string, input: UpdateOrderStatusInput) {
    const status = input.status.toUpperCase();

    const allowedStatuses = [
      'PENDING',
      'CONFIRMED',
      'PROCESSING',
      'SHIPPED',
      'DELIVERED',
      'CANCELLED',
    ];

    if (!allowedStatuses.includes(status)) {
      throw new BadRequestException('Invalid order status');
    }

    const existingOrder = await this.orderRepository.findById(orderId);

    if (!existingOrder) {
      throw new NotFoundException('Order not found');
    }

    const allowedTransitions: Record<string, string[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['PROCESSING', 'CANCELLED'],
      PROCESSING: ['SHIPPED', 'CANCELLED'],
      SHIPPED: ['DELIVERED'],
      DELIVERED: [],
      CANCELLED: [],
    };

    const currentStatus = existingOrder.status;

    if (
      currentStatus !== status &&
      !allowedTransitions[currentStatus]?.includes(status)
    ) {
      throw new BadRequestException(
        `Cannot change order status from ${currentStatus} to ${status}`,
      );
    }

    return this.orderRepository.updateStatus(orderId, { status });
  }
}
