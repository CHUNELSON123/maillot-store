import { BadRequestException, Injectable } from '@nestjs/common';
import {
  DeliveryRepository,
  UpdateDeliveryData,
} from '../../domain/repositories/delivery.repository';

@Injectable()
export class UpdateDeliveryUseCase {
  constructor(private readonly deliveryRepository: DeliveryRepository) {}

  async execute(deliveryId: string, data: UpdateDeliveryData) {
    if (data.deliveryStatus !== undefined) {
      const allowedStatuses = [
        'PENDING',
        'PROCESSING',
        'SHIPPED',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED',
      ];

      const status = data.deliveryStatus.toUpperCase();

      if (!allowedStatuses.includes(status)) {
        throw new BadRequestException('Invalid delivery status');
      }

      data = {
        ...data,
        deliveryStatus: status,
      };
    }

    return this.deliveryRepository.update(deliveryId, data);
  }
}
