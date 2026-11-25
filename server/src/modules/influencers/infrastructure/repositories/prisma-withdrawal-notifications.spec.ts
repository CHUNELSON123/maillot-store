import { PrismaWithdrawalRepository } from './prisma-withdrawal.repository';

jest.mock('../../../../infrastructure/database/prisma.service', () => ({ PrismaService: class {} }));

describe('withdrawal status notifications', () => {
  it.each([
    ['APPROVED', 'requests'],
    ['REJECTED', 'history'],
    ['PAID', 'history'],
  ])('notifies the account owner when a request becomes %s', async (status, tab) => {
    const previous = { id: 'request', influencer_id: 'influencer', amount: 1050, status: status === 'PAID' ? 'APPROVED' : 'PENDING', payment_reference: null, processed_at: null, payout_method: 'MTN', payout_phone: '+237671000000', created_at: new Date(), updated_at: new Date() };
    const tx = {
      withdrawalRequest: { update: jest.fn().mockResolvedValue({ ...previous, status }) },
      influencer: { findFirstOrThrow: jest.fn().mockResolvedValue({ user_id: 'owner' }) },
      notification: { create: jest.fn() },
    };
    const prisma = { withdrawalRequest: { findFirst: jest.fn().mockResolvedValue(previous) }, $transaction: (callback: (client: typeof tx) => unknown) => callback(tx) };
    const repository = new PrismaWithdrawalRepository(prisma as never);

    await repository.updateStatus('request', { status });

    expect(tx.notification.create).toHaveBeenCalledWith({ data: expect.objectContaining({ user_id: 'owner', type: 'WITHDRAWAL', target_url: `/influencer/portal/earnings?tab=${tab}` }) });
  });
});
