import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../../auth/domain/repositories/user.repository';
import { OrderRepository } from '../../domain/repositories/order.repository';

@Injectable()
export class GetOrdersUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly orderRepository: OrderRepository,
  ) {}

  async execute(userId: string) {
    const customerId = await this.userRepository.findCustomerIdByUserId(userId);

    if (!customerId) {
      throw new NotFoundException('Customer profile not found');
    }

    return this.orderRepository.findByCustomer(customerId);
  }
}
