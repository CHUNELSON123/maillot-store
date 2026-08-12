import { Injectable } from '@nestjs/common';
import {
  CreateDeliveryData,
  DeliveryRepository,
} from '../../domain/repositories/delivery.repository';

@Injectable()
export class CreateDeliveryUseCase {
  constructor(private readonly deliveryRepository: DeliveryRepository) {}

  async execute(data: CreateDeliveryData) {
    return this.deliveryRepository.create(data);
  }
}
