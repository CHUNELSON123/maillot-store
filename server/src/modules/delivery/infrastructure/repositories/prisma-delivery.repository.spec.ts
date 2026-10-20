jest.mock('../../../../infrastructure/database/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { PrismaDeliveryRepository } from './prisma-delivery.repository';

describe('PrismaDeliveryRepository customer ownership', () => {
  it('scopes delivery reads to the authenticated customer owning the order', async () => {
    const findFirst = jest.fn().mockResolvedValue(null);
    const repository = new PrismaDeliveryRepository({
      delivery: { findFirst },
    } as unknown as PrismaService);

    await repository.findByOrderIdForCustomer('order-id', 'user-id');

    expect(findFirst).toHaveBeenCalledWith({
      where: {
        order_id: 'order-id',
        deleted_at: null,
        order: {
          deleted_at: null,
          customer: { user_id: 'user-id', deleted_at: null },
        },
      },
    });
  });
});
