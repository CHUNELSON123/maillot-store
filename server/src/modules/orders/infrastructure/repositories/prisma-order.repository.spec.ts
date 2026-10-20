jest.mock('../../../../infrastructure/database/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { createHash } from 'node:crypto';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { PrismaOrderRepository } from './prisma-order.repository';

describe('PrismaOrderRepository customer access', () => {
  it('requires the hashed guest access token to read a guest order', async () => {
    const findFirst = jest.fn().mockResolvedValue(null);
    const repository = new PrismaOrderRepository({
      order: { findFirst },
    } as unknown as PrismaService);
    const token = 'a'.repeat(64);

    await repository.findGuestByIdWithToken('order-id', token);

    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'order-id',
          customer_id: null,
          guest_access_token_hash: createHash('sha256')
            .update(token)
            .digest('hex'),
          deleted_at: null,
        },
      }),
    );
  });

  it('scopes order-number lookups to the authenticated customer', async () => {
    const findFirst = jest.fn().mockResolvedValue(null);
    const repository = new PrismaOrderRepository({
      order: { findFirst },
    } as unknown as PrismaService);

    await repository.findByOrderNumber('customer-id', 'ORD-123');

    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          order_number: 'ORD-123',
          customer_id: 'customer-id',
          deleted_at: null,
        },
      }),
    );
  });
});

describe('PrismaOrderRepository.create', () => {
  it('persists a pending payment with database-priced order items', async () => {
    const now = new Date('2026-10-19T10:00:00.000Z');
    const orderCreate = jest.fn().mockResolvedValue({
      id: 'order-id',
      customer_id: null,
      guest_name: 'Guest Buyer',
      guest_email: 'guest@example.com',
      guest_phone: '670000000',
      order_number: 'ORD-TEST',
      source: 'WEBSITE',
      status: 'PENDING',
      total_amount: 47000,
      influencer_discount_amount: 0,
      inventory_deducted: true,
      delivery_method: 'DELIVERY',
      delivery_fee: 2000,
      delivery_address: 'Market Street',
      delivery_city: 'Buea',
      delivery_postal_code: null,
      created_at: now,
      updated_at: now,
      items: [
        {
          id: 'item-id',
          order_id: 'order-id',
          variant_id: 'variant-id',
          quantity: 1,
          unit_price: 45000,
          created_at: now,
          updated_at: now,
        },
      ],
      payment: {
        id: 'payment-id',
        payment_method_id: 'method-id',
        amount: 47000,
        status: 'PENDING',
        paid_at: null,
        payment_method: { name: 'MTN Mobile Money' },
      },
    });
    const transaction = {
      paymentMethod: {
        findFirst: jest.fn().mockResolvedValue({ id: 'method-id' }),
      },
      productVariant: {
        findMany: jest
          .fn()
          .mockResolvedValue([{ id: 'variant-id', price: 45000 }]),
      },
      inventory: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        findFirst: jest.fn().mockResolvedValue({ id: 'inventory-id' }),
      },
      inventoryMovement: {
        create: jest.fn().mockResolvedValue({ id: 'movement-id' }),
      },
      influencer: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      order: { create: orderCreate },
    };
    const prisma = {
      $transaction: jest.fn(
        (callback: (tx: typeof transaction) => Promise<unknown>) =>
          callback(transaction),
      ),
    } as unknown as PrismaService;

    const repository = new PrismaOrderRepository(prisma);
    const result = await repository.create({
      customerId: null,
      guestName: 'Guest Buyer',
      guestEmail: 'guest@example.com',
      guestPhone: '670000000',
      orderNumber: 'ORD-TEST',
      source: 'WEBSITE',
      status: 'PENDING',
      totalAmount: 0,
      referralCode: null,
      deliveryMethod: 'DELIVERY',
      deliveryFee: 2000,
      deliveryAddress: 'Market Street',
      deliveryCity: 'Buea',
      deliveryPostalCode: null,
      paymentMethod: 'mtn',
      items: [{ variantId: 'variant-id', quantity: 1, unitPrice: 0 }],
    });

    expect(transaction.paymentMethod.findFirst).toHaveBeenCalledWith({
      where: {
        name: 'MTN Mobile Money',
        is_active: true,
        deleted_at: null,
      },
    });
    expect(orderCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          total_amount: 47000,
          inventory_deducted: true,
          payment: {
            create: {
              payment_method_id: 'method-id',
              amount: 47000,
              status: 'PENDING',
            },
          },
          items: {
            create: [
              {
                variant_id: 'variant-id',
                quantity: 1,
                unit_price: 45000,
              },
            ],
          },
        }),
        include: expect.objectContaining({ payment: expect.any(Object) }),
      }),
    );
    expect(result.payment).toEqual({
      id: 'payment-id',
      amount: 47000,
      status: 'PENDING',
      paymentMethodId: 'method-id',
      paymentMethod: 'MTN Mobile Money',
      paidAt: null,
    });
    expect(result.items[0].unitPrice).toBe(45000);
    expect(result.totalAmount).toBe(47000);
    expect(transaction.inventory.updateMany).toHaveBeenCalledWith({
      where: {
        variant_id: 'variant-id',
        deleted_at: null,
        quantity: { gte: 1 },
      },
      data: { quantity: { decrement: 1 } },
    });
    expect(transaction.inventoryMovement.create).toHaveBeenCalledWith({
      data: {
        variant_id: 'variant-id',
        quantity: 1,
        movement_type: 'STOCK_OUT',
        reference: 'Order ORD-TEST',
      },
    });
  });

  it('rejects an invalid referral code without creating an order or reserving stock', async () => {
    const transaction = {
      paymentMethod: {
        findFirst: jest.fn().mockResolvedValue({ id: 'method-id' }),
      },
      productVariant: {
        findMany: jest
          .fn()
          .mockResolvedValue([{ id: 'variant-id', price: 45000 }]),
      },
      influencer: { findFirst: jest.fn().mockResolvedValue(null) },
      inventory: { updateMany: jest.fn() },
      inventoryMovement: { create: jest.fn() },
      order: { create: jest.fn() },
    };
    const prisma = {
      $transaction: jest.fn(
        (callback: (tx: typeof transaction) => Promise<unknown>) =>
          callback(transaction),
      ),
    } as unknown as PrismaService;

    const repository = new PrismaOrderRepository(prisma);
    await expect(
      repository.create({
        customerId: null,
        orderNumber: 'ORD-INVALID-CODE',
        source: 'WEBSITE',
        status: 'PENDING',
        totalAmount: 0,
        referralCode: 'UNKNOWN',
        deliveryMethod: 'PICKUP',
        deliveryFee: 0,
        paymentMethod: 'cash',
        items: [{ variantId: 'variant-id', quantity: 1, unitPrice: 0 }],
      }),
    ).rejects.toThrow('Referral code is invalid or not eligible');

    expect(transaction.order.create).not.toHaveBeenCalled();
    expect(transaction.inventory.updateMany).not.toHaveBeenCalled();
  });

  it('calculates discount from an active influencer rate and stores the referral', async () => {
    const now = new Date('2026-10-19T10:00:00.000Z');
    const orderCreate = jest.fn().mockResolvedValue({
      id: 'order-id',
      customer_id: 'customer-id',
      guest_name: null,
      guest_email: null,
      guest_phone: null,
      order_number: 'ORD-DISCOUNT',
      source: 'WEBSITE',
      status: 'PENDING',
      total_amount: 42500,
      influencer_discount_amount: 4500,
      inventory_deducted: true,
      delivery_method: 'DELIVERY',
      delivery_fee: 2000,
      delivery_address: 'Market Street',
      delivery_city: 'Buea',
      delivery_postal_code: null,
      created_at: now,
      updated_at: now,
      items: [
        {
          id: 'item-id',
          order_id: 'order-id',
          variant_id: 'variant-id',
          quantity: 1,
          unit_price: 45000,
          created_at: now,
          updated_at: now,
        },
      ],
      payment: {
        id: 'payment-id',
        payment_method_id: 'method-id',
        amount: 42500,
        status: 'PENDING',
        paid_at: null,
        payment_method: { name: 'MTN Mobile Money' },
      },
    });
    const transaction = {
      paymentMethod: {
        findFirst: jest.fn().mockResolvedValue({ id: 'method-id' }),
      },
      productVariant: {
        findMany: jest
          .fn()
          .mockResolvedValue([{ id: 'variant-id', price: 45000 }]),
      },
      influencer: {
        findFirst: jest
          .fn()
          .mockResolvedValue({
            id: 'influencer-id',
            customer_discount_rate: 10,
          }),
      },
      customer: {
        findUnique: jest.fn().mockResolvedValue({ user_id: 'customer-user-id' }),
      },
      notification: { create: jest.fn().mockResolvedValue({}) },
      inventory: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
      inventoryMovement: { create: jest.fn().mockResolvedValue({}) },
      order: { create: orderCreate },
    };
    const prisma = {
      $transaction: jest.fn(
        (callback: (tx: typeof transaction) => Promise<unknown>) =>
          callback(transaction),
      ),
    } as unknown as PrismaService;

    const repository = new PrismaOrderRepository(prisma);
    const result = await repository.create({
      customerId: 'customer-id',
      orderNumber: 'ORD-DISCOUNT',
      source: 'WEBSITE',
      status: 'PENDING',
      totalAmount: 0,
      referralCode: 'SAVE10',
      deliveryMethod: 'DELIVERY',
      deliveryFee: 2000,
      paymentMethod: 'mtn',
      items: [{ variantId: 'variant-id', quantity: 1, unitPrice: 0 }],
    });

    expect(transaction.influencer.findFirst).toHaveBeenCalledWith({
      where: {
        referral_code: 'SAVE10',
        status: 'ACTIVE',
        deleted_at: null,
      },
      select: { id: true, customer_discount_rate: true },
    });
    expect(orderCreate.mock.calls[0][0].data).toEqual(
      expect.objectContaining({
        total_amount: 42500,
        influencer_discount_amount: 4500,
        referrals: {
          create: {
            influencer_id: 'influencer-id',
            referral_code: 'SAVE10',
            status: 'PENDING',
          },
        },
      }),
    );
    expect(result.influencerDiscountAmount).toBe(4500);
    expect(result.totalAmount).toBe(42500);
  });

  it('restores stock when cancelling a legacy confirmed order without the marker', async () => {
    const now = new Date('2026-10-19T10:00:00.000Z');
    const existingOrder = {
      id: 'legacy-order-id',
      customer_id: null,
      guest_name: null,
      guest_email: null,
      guest_phone: null,
      order_number: 'ORD-LEGACY-CONFIRMED',
      source: 'WEBSITE',
      status: 'CONFIRMED',
      total_amount: 2000,
      influencer_discount_amount: 0,
      inventory_deducted: false,
      delivery_method: 'PICKUP',
      delivery_fee: 0,
      delivery_address: null,
      delivery_city: null,
      delivery_postal_code: null,
      created_at: now,
      updated_at: now,
      items: [
        {
          id: 'item-id',
          order_id: 'legacy-order-id',
          variant_id: 'variant-id',
          quantity: 2,
          unit_price: 1000,
          created_at: now,
          updated_at: now,
        },
      ],
      payment: null,
    };
    const transaction = {
      order: {
        findFirst: jest.fn().mockResolvedValue(existingOrder),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        findUniqueOrThrow: jest.fn().mockResolvedValue({
          ...existingOrder,
          status: 'CANCELLED',
        }),
      },
      inventory: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
      inventoryMovement: { create: jest.fn().mockResolvedValue({}) },
    };
    const prisma = {
      $transaction: jest.fn(
        (callback: (tx: typeof transaction) => Promise<unknown>) =>
          callback(transaction),
      ),
    } as unknown as PrismaService;

    await new PrismaOrderRepository(prisma).updateStatus('legacy-order-id', {
      status: 'CANCELLED',
    });

    expect(transaction.inventory.updateMany).toHaveBeenCalledWith({
      where: {
        variant_id: 'variant-id',
        deleted_at: null,
      },
      data: { quantity: { increment: 2 } },
    });
    expect(transaction.inventoryMovement.create).toHaveBeenCalledWith({
      data: {
        variant_id: 'variant-id',
        quantity: 2,
        movement_type: 'STOCK_IN',
        reference: 'Cancelled order ORD-LEGACY-CONFIRMED',
      },
    });
  });
});
