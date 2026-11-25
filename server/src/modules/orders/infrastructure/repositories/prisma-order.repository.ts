import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { createHash } from 'node:crypto';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { applyInventoryDelta } from '../../../../infrastructure/database/inventory-stock';
import { createReferralCommissionIfPaid } from '../../../../infrastructure/database/referral-commission';
import { OrderEntity } from '../../domain/entities/order.entity';
import { OrderItemEntity } from '../../domain/entities/order-item.entity';
import {
  CreateOrderData,
  OrderRepository,
  UpdateOrderStatusData,
} from '../../domain/repositories/order.repository';

const orderItemsInclude = {
  where: { deleted_at: null },
  include: {
    variant: {
      include: {
        product: {
          include: {
            images: {
              where: { deleted_at: null },
              orderBy: [{ is_primary: 'desc' as const }, { created_at: 'asc' as const }],
              take: 1,
            },
          },
        },
      },
    },
  },
};

@Injectable()
export class PrismaOrderRepository implements OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateOrderData): Promise<OrderEntity> {
    return this.prisma.$transaction(async (tx) => {
      const paymentMethodNames = {
        mtn: 'MTN Mobile Money',
        orange: 'Orange Money',
        card: 'Bank Card',
        cash: 'Cash Before Delivery',
      } as const;
      const paymentMethod = data.paymentMethod ? await tx.paymentMethod.findFirst({
        where: {
          name: paymentMethodNames[data.paymentMethod],
          is_active: true,
          deleted_at: null,
        },
      }) : null;

      if (data.paymentMethod && !paymentMethod) {
        throw new BadRequestException('Selected payment method is unavailable');
      }

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
          product: { select: { id: true, brand_id: true, category_id: true } },
        },
      });

      const variantsById = new Map(variants.map((variant) => [variant.id, variant]));
      const now = new Date();
      const activePromotions = await tx.promotion.findMany({
        where: { deleted_at: null, is_active: true, start_date: { lte: now }, end_date: { gte: now } },
        select: { id: true, discount_type: true, discount_value: true },
      });
      const promotionSettings = activePromotions.length
        ? await tx.systemSetting.findMany({
            where: { key: { in: activePromotions.map(({ id }) => `cms.promotion.${id}`) }, deleted_at: null },
            select: { key: true, value: true },
          })
        : [];
      const promotionTargets = new Map(promotionSettings.map((setting) => {
        try { return [setting.key.slice('cms.promotion.'.length), JSON.parse(setting.value) as { targetType?: string; targetIds?: string[] }]; }
        catch { return [setting.key.slice('cms.promotion.'.length), { targetType: 'ALL', targetIds: [] }]; }
      }));

      const priceWithPromotion = (originalPrice: number, product: { id: string; brand_id: string | null; category_id: string }) => {
        let bestPrice = originalPrice;
        for (const promotion of activePromotions) {
          const target = promotionTargets.get(promotion.id) ?? { targetType: 'ALL', targetIds: [] };
          const applies = target.targetType === 'ALL'
            || (target.targetType === 'PRODUCT' && target.targetIds?.includes(product.id))
            || (target.targetType === 'BRAND' && product.brand_id !== null && target.targetIds?.includes(product.brand_id))
            || (target.targetType === 'CATEGORY' && target.targetIds?.includes(product.category_id));
          if (!applies) continue;
          const value = Number(promotion.discount_value);
          const type = promotion.discount_type.toUpperCase();
          const candidate = type === 'PERCENTAGE' || type === 'PERCENT'
            ? originalPrice * Math.max(0, 1 - Math.min(value, 100) / 100)
            : Math.max(0, originalPrice - value);
          bestPrice = Math.min(bestPrice, Math.round(candidate * 100) / 100);
        }
        return bestPrice;
      };

      const itemsWithPrices = data.items.map((item) => {
        const variant = variantsById.get(item.variantId);

        if (!variant || variant.price === null) {
          throw new Error(
            `Product variant not found or has no price: ${item.variantId}`,
          );
        }

        return {
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: priceWithPromotion(Number(variant.price), variant.product),
        };
      });

      const subtotal = itemsWithPrices.reduce(
        (total, item) => total + item.quantity * item.unitPrice,
        0,
      );

      let discount = 0;
      let eligibleInfluencer: {
        id: string;
        customer_discount_rate: unknown;
        commission_rate: unknown;
      } | null = null;
      if (data.referralCode) {
        eligibleInfluencer = await tx.influencer.findFirst({
          where: {
            referral_code: data.referralCode,
            status: 'ACTIVE',
            deleted_at: null,
          },
          select: { id: true, customer_discount_rate: true, commission_rate: true },
        });

        const discountRate = Number(eligibleInfluencer?.customer_discount_rate);
        if (!eligibleInfluencer || !Number.isFinite(discountRate) || discountRate < 0 || discountRate > 100) {
          throw new BadRequestException(
            'Referral code is invalid',
          );
        }

        if (discountRate === 0 && !data.referralAttributionToken) {
          throw new BadRequestException('This referral code does not provide a customer discount');
        }

        if (discountRate > 0) discount = Math.round(((subtotal * discountRate) / 100) * 100) / 100;
      }

      const attributionHash = data.referralAttributionToken
        ? createHash('sha256').update(data.referralAttributionToken).digest('hex')
        : null;
      const attributedReferral = attributionHash
        ? await tx.referral.findFirst({
            where: {
              attribution_token_hash: attributionHash,
              deleted_at: null,
              influencer: { status: 'ACTIVE', deleted_at: null },
            },
            include: { influencer: { select: { commission_rate: true } } },
          })
        : null;
      if (attributionHash && !attributedReferral) {
        throw new BadRequestException('Referral attribution is no longer valid');
      }
      if (attributedReferral && eligibleInfluencer && eligibleInfluencer.id !== attributedReferral.influencer_id) {
        throw new BadRequestException('Referral code does not match its attribution');
      }

      const deliverySettings = await tx.systemSetting.findMany({
        where: { key: { in: ['delivery_enabled', 'delivery_fee', 'free_delivery_threshold'] }, deleted_at: null },
        select: { key: true, value: true },
      });
      const deliveryConfig = new Map(deliverySettings.map((setting) => [setting.key, setting.value]));
      if (data.deliveryMethod === 'DELIVERY' && deliveryConfig.get('delivery_enabled') === 'false') {
        throw new BadRequestException('Home delivery is currently unavailable. Select store pickup instead.');
      }
      const configuredFee = deliveryConfig.has('delivery_fee') ? Number(deliveryConfig.get('delivery_fee')) : 2000;
      const freeThreshold = deliveryConfig.has('free_delivery_threshold') ? Number(deliveryConfig.get('free_delivery_threshold')) : 50000;
      const eligibleSubtotal = subtotal - discount;
      const isFreeDelivery = Number.isFinite(freeThreshold) && freeThreshold > 0 && eligibleSubtotal >= freeThreshold;
      const deliveryFee = data.deliveryMethod === 'DELIVERY' && !isFreeDelivery
        ? Number.isFinite(configuredFee) && configuredFee >= 0 ? configuredFee : 2000
        : 0;
      const totalAmount = subtotal - discount + deliveryFee;

      const stockByVariant = new Map<string, number>();
      for (const item of itemsWithPrices) {
        stockByVariant.set(
          item.variantId,
          (stockByVariant.get(item.variantId) ?? 0) + item.quantity,
        );
      }

      for (const [variantId, quantity] of [...stockByVariant].sort(
        ([left], [right]) => left.localeCompare(right),
      )) {
        await applyInventoryDelta(
          tx,
          variantId,
          -quantity,
          'STOCK_OUT',
          `Order ${data.orderNumber}`,
        );
      }

      const order = await tx.order.create({
        data: {
          customer_id: data.customerId ?? null,
          guest_name: data.guestName ?? null,
          guest_email: data.guestEmail ?? null,
          guest_phone: data.guestPhone ?? null,
          guest_access_token_hash: data.guestAccessToken
            ? createHash('sha256').update(data.guestAccessToken).digest('hex')
            : null,
          order_number: data.orderNumber,
          source: data.source,
          status: data.status,
          total_amount: totalAmount,
          influencer_discount_amount: discount,
          inventory_deducted: true,
          delivery_method: data.deliveryMethod,
          delivery_fee: deliveryFee,
          delivery_address: data.deliveryAddress ?? null,
          delivery_city: data.deliveryCity ?? null,
          delivery_postal_code: data.deliveryPostalCode ?? null,
          items: {
            create: itemsWithPrices.map((item) => ({
              variant_id: item.variantId,
              quantity: item.quantity,
              unit_price: item.unitPrice,
            })),
          },
          ...(paymentMethod ? { payment: {
            create: {
              payment_method_id: paymentMethod.id,
              amount: totalAmount,
              status: data.paymentStatus ?? 'PENDING',
              paid_at: data.paymentStatus === 'PAID' ? new Date() : null,
            },
          } } : {}),
          ...(eligibleInfluencer && data.referralCode && !attributedReferral
            ? {
                referrals: {
                  create: {
                    influencer_id: eligibleInfluencer.id,
                    referral_code: data.referralCode,
                    status: 'PENDING',
                    commission_rate_snapshot: Number(eligibleInfluencer.commission_rate),
                  },
                },
              }
            : {}),
        },
        include: {
          items: orderItemsInclude,
          payment: {
            include: {
              payment_method: true,
            },
          },
        },
      });

      if (attributedReferral) {
        await tx.referral.create({
          data: {
            influencer_id: attributedReferral.influencer_id,
            order_id: order.id,
            referral_code: attributedReferral.referral_code,
            status: 'ORDERED',
            commission_rate_snapshot: Number(attributedReferral.influencer.commission_rate),
          },
        });
      }

      if (data.paymentStatus === 'PAID') {
        await createReferralCommissionIfPaid(tx, order.id, data.paymentStatus);
      }

      await this.notifyCustomer(
        tx,
        order.customer_id,
        'Order received',
        `Your order ${order.order_number} has been received and is pending processing.`,
        'ORDER',
      );
      await this.notifyAdmins(tx, order.order_number);

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
        items: orderItemsInclude,
        payment: {
          include: {
            payment_method: true,
          },
        },
      },
    });

    if (!order) {
      return null;
    }

    return this.toEntity(order);
  }

  async findGuestByIdWithToken(
    orderId: string,
    guestAccessToken: string,
  ): Promise<OrderEntity | null> {
    const guestAccessTokenHash = createHash('sha256')
      .update(guestAccessToken)
      .digest('hex');
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        customer_id: null,
        guest_access_token_hash: guestAccessTokenHash,
        deleted_at: null,
      },
      include: {
        items: orderItemsInclude,
        payment: { include: { payment_method: true } },
      },
    });

    return order ? this.toEntity(order) : null;
  }

  async findByCustomer(customerId: string): Promise<OrderEntity[]> {
    const orders = await this.prisma.order.findMany({
      where: {
        customer_id: customerId,
        deleted_at: null,
      },
      include: {
        items: orderItemsInclude,
        payment: {
          include: {
            payment_method: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return orders.map((order) => this.toEntity(order));
  }

  async findByOrderNumber(
    customerId: string,
    orderNumber: string,
  ): Promise<OrderEntity | null> {
    const order = await this.prisma.order.findFirst({
      where: {
        order_number: orderNumber,
        customer_id: customerId,
        deleted_at: null,
      },
      include: {
        items: orderItemsInclude,
        payment: { include: { payment_method: true } },
      },
    });

    return order ? this.toEntity(order) : null;
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
          items: orderItemsInclude,
          payment: {
            include: {
              payment_method: true,
            },
          },
        },
      });

      if (!existingOrder) {
        throw new Error('Order not found');
      }

      const shouldConfirm =
        existingOrder.status === 'PENDING' && data.status === 'CONFIRMED';
      const shouldReleaseReservation =
        ['PENDING', 'CONFIRMED', 'PROCESSING'].includes(existingOrder.status) &&
        data.status === 'CANCELLED';
      const updateResult = await tx.order.updateMany({
        where: { id: orderId, status: existingOrder.status },
        data: {
          status: data.status,
          ...(shouldConfirm && { inventory_deducted: true }),
          ...(shouldReleaseReservation && { inventory_deducted: false }),
        },
      });

      if (updateResult.count === 0) {
        throw new ConflictException('Order status changed; reload and retry');
      }

      if (existingOrder.status !== data.status) {
        await this.notifyCustomer(
          tx,
          existingOrder.customer_id,
          'Order status updated',
          `Your order ${existingOrder.order_number} is now ${data.status.toLowerCase().replaceAll('_', ' ')}.`,
          'ORDER',
        );
      }

      // New orders reserve inventory at creation. Legacy pending orders are
      // still deducted when confirmed because their migration default is false.
      if (shouldConfirm && !existingOrder.inventory_deducted) {
        for (const item of existingOrder.items) {
          await applyInventoryDelta(
            tx,
            item.variant_id,
            -item.quantity,
            'STOCK_OUT',
            `Order ${existingOrder.order_number}`,
          );
        }
      }

      const shouldRestoreStock =
        shouldReleaseReservation &&
        (existingOrder.inventory_deducted ||
          ['CONFIRMED', 'PROCESSING'].includes(existingOrder.status));

      if (shouldRestoreStock) {
        // Legacy confirmed/processing orders had already deducted stock
        // before the per-order marker existed.
        for (const item of existingOrder.items) {
          await applyInventoryDelta(
            tx,
            item.variant_id,
            item.quantity,
            'STOCK_IN',
            `Cancelled order ${existingOrder.order_number}`,
          );
        }
      }

      if (data.status === 'DELIVERED') {
        await createReferralCommissionIfPaid(
          tx,
          orderId,
          existingOrder.payment?.status ?? null,
        );
      }

      const order = await tx.order.findUniqueOrThrow({
        where: { id: orderId },
        include: {
          items: orderItemsInclude,
          payment: {
            include: {
              payment_method: true,
            },
          },
        },
      });

      return this.toEntity(order);
    });
  }

  private toEntity(order: {
    id: string;
    customer_id: string | null;
    guest_name: string | null;
    guest_email: string | null;
    guest_phone: string | null;
    order_number: string;
    source: string;
    status: string;
    total_amount: unknown;
    influencer_discount_amount: unknown;
    delivery_method: string;
    delivery_fee: unknown;
    delivery_address: string | null;
    delivery_city: string | null;
    delivery_postal_code: string | null;
    payment?: {
      id: string;
      payment_method_id: string;
      amount: unknown;
      status: string;
      paid_at: Date | null;
      payment_method: {
        name: string;
      };
    } | null;
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
      variant?: {
        sku: string;
        size: string | null;
        color: string | null;
        product: {
          name: string;
          images: Array<{ image_url: string }>;
        };
      } | null;
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
          item.variant?.sku ?? null,
          item.variant?.size ?? null,
          item.variant?.color ?? null,
          item.variant?.product?.name ?? null,
          item.variant?.product?.images?.[0]?.image_url ?? null,
        ),
    );

    return new OrderEntity(
      order.id,
      order.customer_id,
      order.guest_name,
      order.guest_email,
      order.guest_phone,
      order.order_number,
      order.source,
      order.status,
      Number(order.total_amount),
      Number(order.influencer_discount_amount),
      order.delivery_method,
      Number(order.delivery_fee),
      order.delivery_address,
      order.delivery_city,
      order.delivery_postal_code,
      order.payment
        ? {
            id: order.payment.id,
            amount: Number(order.payment.amount),
            status: order.payment.status,
            paymentMethodId: order.payment.payment_method_id,
            paymentMethod: order.payment.payment_method.name,
            paidAt: order.payment.paid_at,
          }
        : null,
      items,
      order.created_at,
      order.updated_at,
    );
  }

  private async notifyCustomer(
    tx: any,
    customerId: string | null,
    title: string,
    message: string,
    type: string,
  ) {
    if (!customerId) return;

    const notificationSetting = await tx.systemSetting.findFirst({
      where: { key: 'customer_order_notifications', deleted_at: null },
      select: { value: true },
    });
    if (notificationSetting?.value === 'false') return;

    const customer = await tx.customer.findUnique({
      where: { id: customerId },
      select: { user_id: true },
    });

    if (!customer) return;

    await tx.notification.create({
      data: {
        user_id: customer.user_id,
        title,
        message,
        type,
      },
    });
  }

  private async notifyAdmins(tx: any, orderNumber: string) {
    const setting = await tx.systemSetting.findFirst({
      where: { key: 'admin_order_notifications', deleted_at: null },
      select: { value: true },
    });
    if (setting?.value === 'false') return;
    const admins = await tx.user.findMany({
      where: { deleted_at: null, role: { is: { name: 'Administrator', deleted_at: null } } },
      select: { id: true },
    });
    if (!admins.length) return;
    await tx.notification.createMany({
      data: admins.map(({ id }: { id: string }) => ({
        user_id: id,
        title: 'New order received',
        message: `Order ${orderNumber} was placed.`,
        type: 'ORDER',
        target_url: `/admin/orders?search=${encodeURIComponent(orderNumber)}`,
      })),
    });
  }
}
