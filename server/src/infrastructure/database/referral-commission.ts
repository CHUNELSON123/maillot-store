/** Create a commission only after both delivery and verified payment. */
export async function createReferralCommissionIfComplete(
  tx: any,
  orderId: string,
  paymentStatus: string | null,
): Promise<void> {
  if (paymentStatus !== 'PAID') return;

  const order = await tx.order.findFirst({
    where: { id: orderId, status: 'DELIVERED', deleted_at: null },
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
  const rate = Number(referral.influencer.commission_rate);
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
}
