jest.mock('../../../../infrastructure/database/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { PrismaCartRepository } from './prisma-cart.repository';

describe('PrismaCartRepository product without a selected option', () => {
  const makeRepository = (available: boolean) => {
    const prisma = {
      product: { findFirst: jest.fn().mockResolvedValue({ id: 'product' }) },
      productVariant: { findFirst: jest.fn().mockResolvedValue(available ? { id: 'variant' } : null) },
      cartItem: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({
          id: 'cart-item', customer_id: 'customer', product_id: 'product', variant_id: null,
          quantity: 1, created_at: new Date(), updated_at: new Date(),
          product: { id: 'product', name: 'Jersey', price: 100, images: [] }, variant: null,
        }),
      },
    };
    return { prisma, repository: new PrismaCartRepository(prisma as unknown as PrismaService) };
  };

  it('adds an unselected product only when one active priced variant has sufficient stock', async () => {
    const { prisma, repository } = makeRepository(true);
    const item = await repository.addItem('customer', 'product', null, 1);
    expect(item.variantId).toBeNull();
    expect(prisma.productVariant.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ product_id: 'product', status: 'ACTIVE', price: { not: null }, inventory: { is: { deleted_at: null, quantity: { gte: 1 } } } }),
    }));
  });

  it('rejects an unselected product if no variant can fulfil the quantity', async () => {
    const { prisma, repository } = makeRepository(false);
    await expect(repository.addItem('customer', 'product', null, 1)).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.cartItem.create).not.toHaveBeenCalled();
  });
});

