import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { applyInventoryDelta } from '../../../../infrastructure/database/inventory-stock';
import { createReferralCommissionIfComplete } from '../../../../infrastructure/database/referral-commission';
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
          const claim = await tx.order.updateMany({
            where: { id: order.id, status: 'PENDING' },
            data: { status: 'CONFIRMED', inventory_deducted: true },
          });

          if (claim.count > 0 && !order.inventory_deducted) {
            for (const item of order.items) {
              await applyInventoryDelta(
                tx,
                item.variant_id,
                -item.quantity,
                'STOCK_OUT',
                `Order ${order.order_number}`,
              );
            }
          } else if (claim.count === 0) {
            const latestOrder = await tx.order.findFirst({
              where: { id: order.id, deleted_at: null },
              select: { status: true },
            });

            if (latestOrder?.status === 'CANCELLED') {
              throw new ConflictException(
                'Cannot mark payment as PAID for a cancelled order',
              );
            }
          }
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

      if (data.status === 'PAID' && order.status === 'DELIVERED') {
        await createReferralCommissionIfComplete(tx, order.id, data.status);
      }

      if (existingPayment.status !== data.status && order.customer_id) {
        const customer = await tx.customer.findUnique({
          where: { id: order.customer_id },
          select: { user_id: true },
        });
        if (customer) {
          await tx.notification.create({
            data: {
              user_id: customer.user_id,
              title: 'Payment update',
              message: `Payment for order ${order.order_number} is now ${data.status.toLowerCase()}.`,
              type: 'PAYMENT',
            },
          });
        }
      }

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
