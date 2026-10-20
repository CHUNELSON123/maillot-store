jest.mock('../../../../infrastructure/database/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { PrismaCmsRepository } from './prisma-cms.repository';

describe('PrismaCmsRepository.findPromotions', () => {
  it('limits public active promotions to active records within their date range', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const prisma = {
      promotion: { findMany },
    } as unknown as PrismaService;

    const repository = new PrismaCmsRepository(prisma);
    await repository.findPromotions(true);

    expect(findMany).toHaveBeenCalledWith({
      where: {
        deleted_at: null,
        is_active: true,
        start_date: { lte: expect.any(Date) },
        end_date: { gte: expect.any(Date) },
      },
      orderBy: { created_at: 'desc' },
    });
  });
});
