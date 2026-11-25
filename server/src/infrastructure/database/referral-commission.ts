import { notifyAdministrators } from './admin-notifications';
import { notifyInfluencer } from './influencer-notifications';

/** Create a pending commission once the referred order has verified payment. */
export async function createReferralCommissionIfPaid(
  tx: any,
  orderId: string,
  paymentStatus: string | null,
): Promise<void> {
  if (paymentStatus !== 'PAID') return;

  const order = await tx.order.findFirst({
    where: { id: orderId, status: { not: 'CANCELLED' }, deleted_at: null },
    include: { items: { where: { deleted_at: null } } },
  });
  if (!order) return;

  const referral = await tx.referral.findFirst({
    where: { order_id: orderId, deleted_at: null },
    include: { influencer: true },
  });
  if (!referral || referral.influencer.status !== 'ACTIVE') return;

  const existingCommission = await tx.commission.findFirst({
    where: { referral_id: referral.id, deleted_at: null },
  });
  if (existingCommission) return;

  const productSubtotal = order.items.reduce(
    (sum: number, item: { quantity: number; unit_price: unknown }) =>
      sum + item.quantity * Number(item.unit_price),
    0,
  );
  const commissionable = Math.max(
    0,
    productSubtotal - Number(order.influencer_discount_amount),
  );
  const rate = Number(referral.commission_rate_snapshot ?? referral.influencer.commission_rate);
  const amount = Math.round((commissionable * rate) / 100 * 100) / 100;
  if (amount <= 0) return;

  await tx.commission.create({
    data: {
      influencer_id: referral.influencer_id,
      referral_id: referral.id,
      amount,
      commission_rate_snapshot: rate,
      status: 'PENDING',
    },
  });
  await notifyAdministrators(tx, { title: 'Commission awaiting review', message: `A commission of ${amount.toLocaleString()} XAF is ready for review.`, type: 'COMMISSION', targetUrl: `/admin/influencers?influencer=${encodeURIComponent(referral.influencer_id)}#commission-review` });
  await notifyInfluencer(tx, referral.influencer.user_id, { title: 'New commission recorded', message: `A commission of ${amount.toLocaleString()} XAF has been recorded and is awaiting review.`, type: 'COMMISSION', targetUrl: '/influencer/portal/earnings?tab=commissions' });
}
