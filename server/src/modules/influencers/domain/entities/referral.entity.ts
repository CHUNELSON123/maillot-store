export class ReferralEntity {
  constructor(
    public readonly id: string,
    public readonly influencerId: string,
    public readonly orderId: string | null,
    public readonly referralCode: string,
    public readonly status: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly orderNumber: string | null = null,
    public readonly orderStatus: string | null = null,
    public readonly saleAmount: number | null = null,
    public readonly customerLabel: string | null = null,
    public readonly productNames: string[] = [],
  ) {}
}
