export class CustomerRewardEntity {
  constructor(
    public readonly id: string,
    public readonly customerId: string,
    public readonly rewardRuleId: string,
    public readonly rewardType: string,
    public readonly rewardValue: number | null,
    public readonly giftDescription: string | null,
    public readonly status: string,
    public readonly awardedAt: Date,
    public readonly redeemedAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
