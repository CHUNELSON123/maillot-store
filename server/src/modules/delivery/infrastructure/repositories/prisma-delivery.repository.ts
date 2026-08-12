import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { DeliveryEntity } from '../../domain/entities/delivery.entity';
import {
  CreateDeliveryData,
  DeliveryRepository,
  UpdateDeliveryData,
} from '../../domain/repositories/delivery.repository';

@Injectable()
export class PrismaDeliveryRepository implements DeliveryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateDeliveryData): Promise<DeliveryEntity> {
    const order = await this.prisma.order.findFirst({
      where: {
        id: data.orderId,
        deleted_at: null,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const existingDelivery = await this.prisma.delivery.findFirst({
      where: {
        order_id: data.orderId,
        deleted_at: null,
      },
    });

    if (existingDelivery) {
      throw new ConflictException('A delivery already exists for this order');
    }

    const delivery = await this.prisma.delivery.create({
      data: {
        order_id: data.orderId,
        delivery_status: 'PENDING',
        address: data.address,
        provider: data.provider,
      },
    });

    return this.toEntity(delivery);
  }

  async findByOrderId(orderId: string): Promise<DeliveryEntity | null> {
    const delivery = await this.prisma.delivery.findFirst({
      where: {
        order_id: orderId,
        deleted_at: null,
      },
    });

    if (!delivery) {
      return null;
    }

    return this.toEntity(delivery);
  }

  async update(
    deliveryId: string,
    data: UpdateDeliveryData,
  ): Promise<DeliveryEntity> {
    const existingDelivery = await this.prisma.delivery.findFirst({
      where: {
        id: deliveryId,
        deleted_at: null,
      },
    });

    if (!existingDelivery) {
      throw new NotFoundException('Delivery not found');
    }

    const deliveryStatus = data.deliveryStatus?.toUpperCase();

    const deliveredAt =
      deliveryStatus === 'DELIVERED'
        ? (existingDelivery.delivered_at ?? new Date())
        : existingDelivery.delivered_at;

    const delivery = await this.prisma.delivery.update({
      where: {
        id: deliveryId,
      },
      data: {
        ...(deliveryStatus !== undefined && {
          delivery_status: deliveryStatus,
        }),
        ...(data.address !== undefined && {
          address: data.address,
        }),
        ...(data.trackingNumber !== undefined && {
          tracking_number: data.trackingNumber,
        }),
        ...(data.provider !== undefined && {
          provider: data.provider,
        }),
        delivered_at: deliveredAt,
      },
    });

    return this.toEntity(delivery);
  }

  private toEntity(delivery: {
    id: string;
    order_id: string;
    delivery_status: string;
    address: string;
    tracking_number: string | null;
    provider: string | null;
    delivered_at: Date | null;
    created_at: Date;
    updated_at: Date;
  }): DeliveryEntity {
    return new DeliveryEntity(
      delivery.id,
      delivery.order_id,
      delivery.delivery_status,
      delivery.address,
      delivery.tracking_number,
      delivery.provider,
      delivery.delivered_at,
      delivery.created_at,
      delivery.updated_at,
    );
  }
}
