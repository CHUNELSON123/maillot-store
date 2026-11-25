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

  it('idempotently subscribes or reactivates an email address', async () => {
    const upsert = jest.fn().mockResolvedValue({});
    const repository = new PrismaCommunicationsRepository({
      newsletterSubscription: { upsert },
    } as unknown as PrismaService);

    await repository.subscribeToNewsletter({ email: 'customer@example.com' });

    expect(upsert).toHaveBeenCalledWith({
      where: { email: 'customer@example.com' },
      create: { email: 'customer@example.com', phone: null, whatsapp_opt_in: false },
      update: {
        is_active: true,
        unsubscribed_at: null,
        deleted_at: null,
        whatsapp_opt_in: false,
      },
    });
  });

  it('creates a phone-only subscription with explicit WhatsApp opt-in', async () => {
    const findFirst = jest.fn().mockResolvedValue(null);
    const create = jest.fn().mockResolvedValue({});
    const repository = new PrismaCommunicationsRepository({
      newsletterSubscription: { findFirst, create },
    } as unknown as PrismaService);

    await repository.subscribeToNewsletter({ phone: '+237600000000' }, true);

    expect(findFirst).toHaveBeenCalledWith({ where: { phone: '+237600000000' } });
    expect(create).toHaveBeenCalledWith({ data: expect.objectContaining({
      email: null,
      phone: '+237600000000',
      whatsapp_opt_in: true,
    }) });
  });
});
