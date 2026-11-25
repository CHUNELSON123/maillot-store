jest.mock('../../../../infrastructure/database/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { PrismaProductRepository } from './prisma-product.repository';

describe('PrismaProductRepository.update', () => {
  it('updates base-priced variants while leaving custom-priced variants unchanged', async () => {
    const tx = {
      product: {
        findUniqueOrThrow: jest.fn().mockResolvedValue({ price: 100 }),
        update: jest.fn().mockResolvedValue({ id: 'p', category_id: 'c', brand_id: null, name: 'Jersey', description: null, season: null, edition: null, price: 120, status: 'ACTIVE', created_at: new Date(), updated_at: new Date() }),
      },
      productVariant: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
    };
    const prisma = { $transaction: jest.fn((callback) => callback(tx)) };
    const repository = new PrismaProductRepository(prisma as never);
    await repository.update('p', { price: 120 });
    expect(tx.productVariant.updateMany).toHaveBeenCalledWith({ where: { product_id: 'p', deleted_at: null, price: 100 }, data: { price: 120 } });
  });
});

describe('PrismaProductRepository.findPage', () => {
  it('applies database category/search filters and paging', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const count = jest.fn().mockResolvedValue(31);
    const repository = new PrismaProductRepository({
      product: { findMany, count },
    } as unknown as PrismaService);

    const result = await repository.findPage({
      page: 2,
      limit: 12,
      categoryId: 'category-id',
      search: 'jersey',
      sort: 'price-asc',
    });

    const where = {
      deleted_at: null,
      category_id: 'category-id',
      OR: [
        { name: { contains: 'jersey', mode: 'insensitive' } },
        { description: { contains: 'jersey', mode: 'insensitive' } },
      ],
    };
    expect(findMany).toHaveBeenCalledWith({
      where,
      orderBy: { price: 'asc' },
      skip: 12,
      take: 12,
    });
    expect(count).toHaveBeenCalledWith({ where });
    expect(result.total).toBe(31);
    expect(result.items).toEqual([]);
  });
});
