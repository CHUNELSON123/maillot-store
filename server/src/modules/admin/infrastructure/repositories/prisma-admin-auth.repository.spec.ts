jest.mock('../../../../infrastructure/database/prisma.service', () => ({ PrismaService: class PrismaService {} }));

import { ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { PrismaAdminAuthRepository } from './prisma-admin-auth.repository';

describe('PrismaAdminAuthRepository', () => {
  it('creates an Administrator account under a transaction lock and writes an audit log', async () => {
    const tx = {
      $queryRaw: jest.fn().mockResolvedValue([{ locked: true }]),
      user: { count: jest.fn().mockResolvedValue(0), create: jest.fn().mockResolvedValue({ id: 'admin-id', email: 'admin@example.com' }) },
      role: { findFirst: jest.fn().mockResolvedValue({ id: 'admin-role-id', name: 'Administrator' }) },
      auditLog: { create: jest.fn().mockResolvedValue({}) },
    };
    const prisma = { $transaction: jest.fn((callback: (transaction: typeof tx) => Promise<unknown>) => callback(tx)) } as unknown as PrismaService;
    const repository = new PrismaAdminAuthRepository(prisma);

    await expect(repository.createAdministratorAccount({ email: 'admin@example.com', passwordHash: 'hashed-password' })).resolves.toEqual({ id: 'admin-id', email: 'admin@example.com' });
    expect(tx.$queryRaw).toHaveBeenCalledTimes(1);
    expect(tx.user.create).toHaveBeenCalledWith({ data: { email: 'admin@example.com', password: 'hashed-password', role_id: 'admin-role-id' }, select: { id: true, email: true } });
    expect(tx.auditLog.create).toHaveBeenCalledTimes(1);
  });

  it('does not create more than three Administrator accounts', async () => {
    const tx = {
      $queryRaw: jest.fn().mockResolvedValue([{ locked: true }]),
      user: { count: jest.fn().mockResolvedValue(3), create: jest.fn() },
      role: { findFirst: jest.fn() },
      auditLog: { create: jest.fn() },
    };
    const prisma = { $transaction: jest.fn((callback: (transaction: typeof tx) => Promise<unknown>) => callback(tx)) } as unknown as PrismaService;
    const repository = new PrismaAdminAuthRepository(prisma);

    await expect(repository.createAdministratorAccount({ email: 'fourth@example.com', passwordHash: 'hashed-password' })).rejects.toBeInstanceOf(ConflictException);
    expect(tx.user.create).not.toHaveBeenCalled();
  });

  it('rejects a concurrent registration attempt when the lock is already held', async () => {
    const tx = {
      $queryRaw: jest.fn().mockResolvedValue([{ locked: false }]),
      user: { count: jest.fn(), create: jest.fn() },
      role: { findFirst: jest.fn() },
      auditLog: { create: jest.fn() },
    };
    const prisma = { $transaction: jest.fn((callback: (transaction: typeof tx) => Promise<unknown>) => callback(tx)) } as unknown as PrismaService;
    const repository = new PrismaAdminAuthRepository(prisma);

    await expect(repository.createAdministratorAccount({ email: 'admin@example.com', passwordHash: 'hashed-password' })).rejects.toBeInstanceOf(ConflictException);
    expect(tx.user.create).not.toHaveBeenCalled();
  });
});
