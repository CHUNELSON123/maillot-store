import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { OrderEntity } from '../../domain/entities/order.entity';
import { OrderItemEntity } from '../../domain/entities/order-item.entity';
import {
  CreateOrderData,
  OrderRepository,
  UpdateOrderStatusData,
} from '../../domain/repositories/order.repository';

@Injectable()
export class PrismaOrderRepository implements OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateOrderData): Promise<OrderEntity> {
    return this.prisma.$transaction(async (tx) => {
      const variants = await tx.productVariant.findMany({
        where: {
          id: {
            in: data.items.map((item) => item.variantId),
          },
          deleted_at: null,
        },
        select: {
          id: true,
          price: true,
        },
      });

      const variantPrices = new Map(
        variants.map((variant) => [
          variant.id,
          variant.price === null ? null : Number(variant.price),
        ]),
      );

      const itemsWithPrices = data.items.map((item) => {
        const unitPrice = variantPrices.get(item.variantId);

        if (unitPrice === undefined || unitPrice === null) {
          throw new Error(
            `Product variant not found or has no price: ${item.variantId}`,
          );
        }

        return {
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice,
        };
      });

      const subtotal = itemsWithPrices.reduce(
        (total, item) => total + item.quantity * item.unitPrice,
        0,
      );

      const discount = data.influencerDiscountAmount ?? 0;
      const totalAmount = Math.max(0, subtotal - discount);

      const order = await tx.order.create({
        data: {
          customer_id: data.customerId,
          order_number: data.orderNumber,
          source: data.source,
          status: data.status,
          total_amount: totalAmount,
          influencer_discount_amount: discount,
          items: {
            create: itemsWithPrices.map((item) => ({
              variant_id: item.variantId,
              quantity: item.quantity,
              unit_price: item.unitPrice,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      return this.toEntity(order);
    });
  }

  async findById(
    orderId: string,
    customerId?: string,
  ): Promise<OrderEntity | null> {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        deleted_at: null,
        ...(customerId !== undefined && {
          customer_id: customerId,
        }),
      },
      include: {
        items: {
          where: {
            deleted_at: null,
          },
        },
      },
    });

    if (!order) {
      return null;
    }

    return this.toEntity(order);
  }

  async findByCustomer(customerId: string): Promise<OrderEntity[]> {
    const orders = await this.prisma.order.findMany({
      where: {
        customer_id: customerId,
        deleted_at: null,
      },
      include: {
        items: {
          where: {
            deleted_at: null,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return orders.map((order) => this.toEntity(order));
  }

  async updateStatus(
    orderId: string,
    data: UpdateOrderStatusData,
  ): Promise<OrderEntity> {
    return this.prisma.$transaction(async (tx) => {
      const existingOrder = await tx.order.findFirst({
        where: {
          id: orderId,
          deleted_at: null,
        },
        include: {
          items: {
            where: {
              deleted_at: null,
            },
          },
        },
      });

      if (!existingOrder) {
        throw new Error('Order not found');
      }

      // Only deduct inventory when moving from PENDING to CONFIRMED.
      const shouldDeductInventory =
        existingOrder.status === 'PENDING' && data.status === 'CONFIRMED';

      if (shouldDeductInventory) {
        for (const item of existingOrder.items) {
          const updatedInventory = await tx.inventory.updateMany({
            where: {
              variant_id: item.variant_id,
              deleted_at: null,
              quantity: {
                gte: item.quantity,
              },
            },
            data: {
              quantity: {
                decrement: item.quantity,
              },
            },
          });

          if (updatedInventory.count === 0) {
            throw new Error(
              `Insufficient stock for variant ${item.variant_id}`,
            );
          }

          await tx.inventoryMovement.create({
            data: {
              variant_id: item.variant_id,
              quantity: item.quantity,
              movement_type: 'STOCK_OUT',
              reference: `Order ${existingOrder.order_number}`,
            },
          });
        }
      }

      const order = await tx.order.update({
        where: {
          id: orderId,
        },
        data: {
          status: data.status,
        },
        include: {
          items: {
            where: {
              deleted_at: null,
            },
          },
        },
      });

      return this.toEntity(order);
    });
  }

  private toEntity(order: {
    id: string;
    customer_id: string;
    order_number: string;
    source: string;
    status: string;
    total_amount: unknown;
    influencer_discount_amount: unknown;
    created_at: Date;
    updated_at: Date;
    items: Array<{
      id: string;
      order_id: string;
      variant_id: string;
      quantity: number;
      unit_price: unknown;
      created_at: Date;
      updated_at: Date;
    }>;
  }): OrderEntity {
    const items = order.items.map(
      (item) =>
        new OrderItemEntity(
          item.id,
          item.order_id,
          item.variant_id,
          item.quantity,
          Number(item.unit_price),
          item.created_at,
          item.updated_at,
        ),
    );

    return new OrderEntity(
      order.id,
      order.customer_id,
      order.order_number,
      order.source,
      order.status,
      Number(order.total_amount),
      Number(order.influencer_discount_amount),
      items,
      order.created_at,
      order.updated_at,
    );
  }
}
