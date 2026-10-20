import { Injectable, NotFoundException } from '@nestjs/common';
import { DeliveryRepository } from '../../domain/repositories/delivery.repository';

@Injectable()
export class GetDeliveryUseCase {
  constructor(private readonly deliveryRepository: DeliveryRepository) {}

  async execute(orderId: string, customerUserId?: string) {
    const delivery = customerUserId
      ? await this.deliveryRepository.findByOrderIdForCustomer(
          orderId,
          customerUserId,
        )
      : await this.deliveryRepository.findByOrderId(orderId);

    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    return delivery;
  }
}
