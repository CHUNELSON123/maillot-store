jest.mock('../../../infrastructure/database/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { PrismaCommunicationsRepository } from './prisma-communications.repository';

describe('PrismaCommunicationsRepository', () => {
  it('persists submitted contact messages', async () => {
    const createdAt = new Date('2026-10-20T10:00:00.000Z');
    const create = jest.fn().mockResolvedValue({
      id: 'message-id',
      created_at: createdAt,
    });
    const repository = new PrismaCommunicationsRepository({
      contactMessage: { create },
    } as unknown as PrismaService);

    await expect(
      repository.submitContactMessage({
        name: 'Customer',
        email: 'customer@example.com',
        subject: 'Question',
        message: 'Please contact me.',
      }),
    ).resolves.toEqual({ id: 'message-id', createdAt });
    expect(create).toHaveBeenCalledWith({
      data: {
        name: 'Customer',
        email: 'customer@example.com',
        subject: 'Question',
        message: 'Please contact me.',
      },
      select: { id: true, created_at: true },
    });
  });

  it('idempotently subscribes or reactivates a normalized address', async () => {
    const upsert = jest.fn().mockResolvedValue({});
    const repository = new PrismaCommunicationsRepository({
      newsletterSubscription: { upsert },
    } as unknown as PrismaService);

    await repository.subscribeToNewsletter('customer@example.com');

    expect(upsert).toHaveBeenCalledWith({
      where: { email: 'customer@example.com' },
      create: { email: 'customer@example.com' },
      update: {
        is_active: true,
        unsubscribed_at: null,
        deleted_at: null,
      },
    });
  });
});
