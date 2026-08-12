import { DeliveryEntity } from '../entities/delivery.entity';

export interface CreateDeliveryData {
  orderId: string;
  address: string;
  provider?: string;
}

export interface UpdateDeliveryData {
  deliveryStatus?: string;
  address?: string;
  trackingNumber?: string;
  provider?: string;
}

export abstract class DeliveryRepository {
  abstract create(data: CreateDeliveryData): Promise<DeliveryEntity>;

  abstract findByOrderId(orderId: string): Promise<DeliveryEntity | null>;

  abstract update(
    deliveryId: string,
    data: UpdateDeliveryData,
  ): Promise<DeliveryEntity>;
}
