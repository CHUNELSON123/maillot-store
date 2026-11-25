import { createReferralCommissionIfPaid } from './referral-commission';

describe('createReferralCommissionIfPaid', () => {
  it('does not create commission before payment is PAID', async () => {
    const tx = { order: { findFirst: jest.fn() } };

    await createReferralCommissionIfPaid(tx, 'order-id', 'PENDING');

    expect(tx.order.findFirst).not.toHaveBeenCalled();
  });

  it('creates the commission once delivery and payment are complete', async () => {
    const commissionCreate = jest.fn();
    const tx = {
      user: { findMany: jest.fn().mockResolvedValue([{ id: 'admin-id' }]) },
      notification: { createMany: jest.fn(), create: jest.fn() },
      order: {
        findFirst: jest.fn().mockResolvedValue({
          influencer_discount_amount: 100,
          items: [{ quantity: 2, unit_price: 1000 }],
        }),
      },
      referral: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'referral-id',
          influencer_id: 'influencer-id',
          influencer: { status: 'ACTIVE', commission_rate: 10, user_id: 'influencer-user-id' },
        }),
      },
      commission: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: commissionCreate,
      },
    };

    await createReferralCommissionIfPaid(tx, 'order-id', 'PAID');

    expect(tx.notification.create).toHaveBeenCalledWith({ data: expect.objectContaining({ user_id: 'influencer-user-id', type: 'COMMISSION', target_url: '/influencer/portal/earnings?tab=commissions' }) });

    expect(tx.notification.createMany).toHaveBeenCalledWith({
      data: [expect.objectContaining({
        user_id: 'admin-id',
        type: 'COMMISSION',
        target_url: '/admin/influencers?influencer=influencer-id#commission-review',
      })],
    });

    expect(commissionCreate).toHaveBeenCalledWith({
      data: {
        influencer_id: 'influencer-id',
        referral_id: 'referral-id',
        amount: 190,
        commission_rate_snapshot: 10,
        status: 'PENDING',
      },
    });
  });
});
