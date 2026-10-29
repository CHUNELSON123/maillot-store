jest.mock('../../../../infrastructure/database/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { PrismaAdminReadRepository } from './prisma-admin-read.repository';

describe('PrismaAdminReadRepository', () => {
  it('does not expose guest access-token hashes in admin order results', async () => {
    const order = { id: 'order-id', guest_access_token_hash: 'sensitive-hash' };
    const prisma = {
      order: { findMany: jest.fn().mockResolvedValue([order]), count: jest.fn().mockResolvedValue(1) },
    } as unknown as PrismaService;
    const repository = new PrismaAdminReadRepository(prisma);

    const result = await repository.listOrders({ page: 1, limit: 20 });

    expect(result).toEqual({ items: [{ id: 'order-id' }], total: 1, page: 1, limit: 20 });
  });

  it('prevents deactivating the last active administrator', async () => {
    const userUpdate = jest.fn();
    const transaction = {
      user: {
        findFirst: jest.fn().mockResolvedValue({ id: 'admin-id', deleted_at: null, role: { name: 'Administrator' } }),
        count: jest.fn().mockResolvedValue(0),
        update: userUpdate,
      },
      role: { findFirst: jest.fn() },
      auditLog: { create: jest.fn() },
    };
    const prisma = {
      $transaction: jest.fn((callback: (tx: typeof transaction) => Promise<unknown>) => callback(transaction)),
    } as unknown as PrismaService;
    const repository = new PrismaAdminReadRepository(prisma);

    await expect(repository.updateUser('admin-id', { active: false }, 'admin-id')).rejects.toBeInstanceOf(ConflictException);
    expect(userUpdate).not.toHaveBeenCalled();
  });

});
