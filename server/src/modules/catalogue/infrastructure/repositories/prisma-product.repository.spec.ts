jest.mock('../../../../infrastructure/database/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { PrismaProductRepository } from './prisma-product.repository';

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
