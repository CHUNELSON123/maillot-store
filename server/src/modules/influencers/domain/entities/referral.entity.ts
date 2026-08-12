export class ReferralEntity {
  constructor(
    public readonly id: string,
    public readonly influencerId: string,
    public readonly orderId: string | null,
    public readonly referralCode: string,
    public readonly status: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
