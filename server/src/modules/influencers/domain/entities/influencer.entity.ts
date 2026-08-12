export class InfluencerEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly referralCode: string,
    public readonly status: string,
    public readonly commissionRate: number,
    public readonly customerDiscountRate: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
