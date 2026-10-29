jest.mock('../../../../infrastructure/database/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { PrismaProductVariantRepository } from './prisma-product-variant.repository';

describe('PrismaProductVariantRepository.create', () => {
  it('creates the variant and its zero-stock inventory row in one transaction', async () => {
    const now = new Date('2026-10-19T10:00:00.000Z');
    const variant = {
      id: 'variant-id',
      product_id: 'product-id',
      sku: 'SKU-001',
      size: 'M',
      color: 'Black',
      edition: null,
      price: null,
      status: 'ACTIVE',
      created_at: now,
      updated_at: now,
    };
    const transaction = {
      productVariant: { create: jest.fn().mockResolvedValue(variant) },
      inventory: { create: jest.fn().mockResolvedValue({ id: 'inventory-id' }) },
    };
    const prisma = {
      $transaction: jest.fn(
        (callback: (tx: typeof transaction) => Promise<unknown>) =>
          callback(transaction),
      ),
    } as unknown as PrismaService;

    const repository = new PrismaProductVariantRepository(prisma);
    const result = await repository.create({
      productId: 'product-id',
      sku: 'SKU-001',
      size: 'M',
      color: 'Black',
      status: 'ACTIVE',
    });

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(transaction.inventory.create).toHaveBeenCalledWith({
      data: { variant_id: 'variant-id', quantity: 0, min_stock: 0 },
    });
    expect(result.id).toBe('variant-id');
  });
});
