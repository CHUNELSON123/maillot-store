import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../../auth/domain/repositories/user.repository';
import { OrderRepository } from '../../domain/repositories/order.repository';

@Injectable()
export class GetOrderUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly orderRepository: OrderRepository,
  ) {}

  async execute(userId: string, orderId: string) {
    const customerId = await this.userRepository.findCustomerIdByUserId(userId);

    if (!customerId) {
      throw new NotFoundException('Customer profile not found');
    }

    const order = await this.orderRepository.findById(orderId, customerId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }
}
