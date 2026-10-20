import { createReferralCommissionIfComplete } from './referral-commission';

describe('createReferralCommissionIfComplete', () => {
  it('does not create commission before payment is PAID', async () => {
    const tx = { order: { findFirst: jest.fn() } };

    await createReferralCommissionIfComplete(tx, 'order-id', 'PENDING');

    expect(tx.order.findFirst).not.toHaveBeenCalled();
  });

  it('creates the commission once delivery and payment are complete', async () => {
    const commissionCreate = jest.fn();
    const tx = {
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
          influencer: { status: 'ACTIVE', commission_rate: 10 },
        }),
      },
      commission: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: commissionCreate,
      },
    };

    await createReferralCommissionIfComplete(tx, 'order-id', 'PAID');

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
