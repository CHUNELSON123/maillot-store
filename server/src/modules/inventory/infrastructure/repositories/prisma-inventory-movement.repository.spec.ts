jest.mock('../../../../infrastructure/database/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { PrismaInventoryMovementRepository } from './prisma-inventory-movement.repository';

describe('PrismaInventoryMovementRepository.create', () => {
  it('updates stock and records the movement in the same transaction', async () => {
    const now = new Date('2026-10-19T10:00:00.000Z');
    const movementCreate = jest.fn().mockResolvedValue({
      id: 'movement-id',
      variant_id: 'variant-id',
      quantity: 3,
      movement_type: 'STOCK_OUT',
      reference: 'Manual stock movement',
      created_at: now,
      updated_at: now,
    });
    const transaction = {
      inventory: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        findFirst: jest.fn(),
      },
      inventoryMovement: { create: movementCreate },
    };
    const prisma = {
      $transaction: jest.fn(
        (callback: (tx: typeof transaction) => Promise<unknown>) =>
          callback(transaction),
      ),
    } as unknown as PrismaService;

    const repository = new PrismaInventoryMovementRepository(prisma);
    const result = await repository.create({
      variantId: 'variant-id',
      quantity: 3,
      movementType: 'STOCK_OUT',
    });

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(transaction.inventory.updateMany).toHaveBeenCalledWith({
      where: {
        variant_id: 'variant-id',
        deleted_at: null,
        quantity: { gte: 3 },
      },
      data: { quantity: { decrement: 3 } },
    });
    expect(movementCreate).toHaveBeenCalledWith({
      data: {
        variant_id: 'variant-id',
        quantity: 3,
        movement_type: 'STOCK_OUT',
        reference: 'Manual stock movement',
      },
    });
    expect(result.quantity).toBe(3);
  });
});
