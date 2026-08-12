import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { PaymentEntity } from '../../domain/entities/payment.entity';
import {
  CreatePaymentData,
  PaymentRepository,
  UpdatePaymentStatusData,
} from '../../domain/repositories/payment.repository';

@Injectable()
export class PrismaPaymentRepository implements PaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreatePaymentData): Promise<PaymentEntity> {
    const order = await this.prisma.order.findFirst({
      where: {
        id: data.orderId,
        customer_id: data.customerId,
        deleted_at: null,
      },
      select: {
        id: true,
        total_amount: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const paymentMethod = await this.prisma.paymentMethod.findFirst({
      where: {
        id: data.paymentMethodId,
        is_active: true,
        deleted_at: null,
      },
    });

    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found or inactive');
    }

    const existingPayment = await this.prisma.payment.findFirst({
      where: {
        order_id: data.orderId,
        deleted_at: null,
      },
    });

    if (existingPayment) {
      throw new ConflictException('A payment already exists for this order');
    }

    const payment = await this.prisma.payment.create({
      data: {
        order_id: data.orderId,
        payment_method_id: data.paymentMethodId,
        amount: order.total_amount,
        status: 'PENDING',
        transaction_reference: data.transactionReference,
      },
    });

    return this.toEntity(payment);
  }

  async findById(paymentId: string): Promise<PaymentEntity | null> {
    const payment = await this.prisma.payment.findFirst({
      where: {
        id: paymentId,
        deleted_at: null,
      },
    });

    if (!payment) {
      return null;
    }

    return this.toEntity(payment);
  }

  async findByOrderId(
    orderId: string,
    customerId?: string,
  ): Promise<PaymentEntity | null> {
    const payment = await this.prisma.payment.findFirst({
      where: {
        order_id: orderId,
        deleted_at: null,
        ...(customerId !== undefined && {
          order: {
            customer_id: customerId,
            deleted_at: null,
          },
        }),
      },
    });

    if (!payment) {
      return null;
    }

    return this.toEntity(payment);
  }

  async updateStatus(
    paymentId: string,
    data: UpdatePaymentStatusData,
  ): Promise<PaymentEntity> {
    return this.prisma.$transaction(async (tx) => {
      const existingPayment = await tx.payment.findFirst({
        where: {
          id: paymentId,
          deleted_at: null,
        },
      });

      if (!existingPayment) {
        throw new NotFoundException('Payment not found');
      }

      const order = await tx.order.findFirst({
        where: {
          id: existingPayment.order_id,
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

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      const isBecomingPaid =
        existingPayment.status !== 'PAID' && data.status === 'PAID';

      if (isBecomingPaid) {
        if (order.status === 'CANCELLED') {
          throw new ConflictException(
            'Cannot mark payment as PAID for a cancelled order',
          );
        }

        /*
         * If the order is still PENDING, payment confirmation
         * confirms the order and deducts inventory.
         */
        if (order.status === 'PENDING') {
          for (const item of order.items) {
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
              throw new ConflictException(
                `Insufficient stock for variant ${item.variant_id}`,
              );
            }

            await tx.inventoryMovement.create({
              data: {
                variant_id: item.variant_id,
                quantity: item.quantity,
                movement_type: 'STOCK_OUT',
                reference: `Order ${order.order_number}`,
              },
            });
          }

          await tx.order.update({
            where: {
              id: order.id,
            },
            data: {
              status: 'CONFIRMED',
            },
          });
        }
      }

      const paidAt =
        data.status === 'PAID'
          ? (existingPayment.paid_at ?? new Date())
          : existingPayment.paid_at;

      const payment = await tx.payment.update({
        where: {
          id: paymentId,
        },
        data: {
          status: data.status,
          ...(data.transactionReference !== undefined && {
            transaction_reference: data.transactionReference,
          }),
          paid_at: paidAt,
        },
      });

      return this.toEntity(payment);
    });
  }

  private toEntity(payment: {
    id: string;
    order_id: string;
    payment_method_id: string;
    amount: unknown;
    status: string;
    transaction_reference: string | null;
    paid_at: Date | null;
    created_at: Date;
    updated_at: Date;
  }): PaymentEntity {
    return new PaymentEntity(
      payment.id,
      payment.order_id,
      payment.payment_method_id,
      Number(payment.amount),
      payment.status,
      payment.transaction_reference,
      payment.paid_at,
      payment.created_at,
      payment.updated_at,
    );
  }
}
