jest.mock('../../../../infrastructure/database/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { PrismaPaymentRepository } from './prisma-payment.repository';

describe('PrismaPaymentRepository.updateStatus', () => {
  it('does not deduct inventory a second time for an order reserved at checkout', async () => {
    const now = new Date('2026-10-19T10:00:00.000Z');
    const paymentUpdate = jest.fn().mockResolvedValue({
      id: 'payment-id',
      order_id: 'order-id',
      payment_method_id: 'method-id',
      amount: 47000,
      status: 'PAID',
      transaction_reference: 'verified-ref',
      paid_at: now,
      created_at: now,
      updated_at: now,
    });
    const transaction = {
      payment: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'payment-id',
          order_id: 'order-id',
          status: 'PENDING',
          paid_at: null,
        }),
        update: paymentUpdate,
      },
      order: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'order-id',
          order_number: 'ORD-TEST',
          status: 'PENDING',
          inventory_deducted: true,
          items: [{ variant_id: 'variant-id', quantity: 1 }],
        }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      inventory: { updateMany: jest.fn() },
      inventoryMovement: { create: jest.fn() },
    };
    const prisma = {
      $transaction: jest.fn(
        (callback: (tx: typeof transaction) => Promise<unknown>) =>
          callback(transaction),
      ),
    } as unknown as PrismaService;

    const repository = new PrismaPaymentRepository(prisma);
    const result = await repository.updateStatus('payment-id', {
      status: 'PAID',
      transactionReference: 'verified-ref',
    });

    expect(transaction.order.updateMany).toHaveBeenCalledWith({
      where: { id: 'order-id', status: 'PENDING' },
      data: { status: 'CONFIRMED', inventory_deducted: true },
    });
    expect(transaction.inventory.updateMany).not.toHaveBeenCalled();
    expect(transaction.inventoryMovement.create).not.toHaveBeenCalled();
    expect(result.status).toBe('PAID');
  });

  it('deducts stock when payment confirms a legacy pending order', async () => {
    const now = new Date('2026-10-19T10:00:00.000Z');
    const transaction = {
      payment: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'payment-id',
          order_id: 'order-id',
          status: 'PENDING',
          paid_at: null,
        }),
        update: jest.fn().mockResolvedValue({
          id: 'payment-id',
          order_id: 'order-id',
          payment_method_id: 'method-id',
          amount: 2000,
          status: 'PAID',
          transaction_reference: 'legacy-ref',
          paid_at: now,
          created_at: now,
          updated_at: now,
        }),
      },
      order: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'order-id',
          order_number: 'ORD-LEGACY',
          status: 'PENDING',
          inventory_deducted: false,
          items: [{ variant_id: 'variant-id', quantity: 2 }],
        }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
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

    await new PrismaPaymentRepository(prisma).updateStatus('payment-id', {
      status: 'PAID',
      transactionReference: 'legacy-ref',
    });

    expect(transaction.inventory.updateMany).toHaveBeenCalledWith({
      where: {
        variant_id: 'variant-id',
        deleted_at: null,
        quantity: { gte: 2 },
      },
      data: { quantity: { decrement: 2 } },
    });
    expect(transaction.inventoryMovement.create).toHaveBeenCalledWith({
      data: {
        variant_id: 'variant-id',
        quantity: 2,
        movement_type: 'STOCK_OUT',
        reference: 'Order ORD-LEGACY',
      },
    });
  });
});
