export class CustomerRewardRuleEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly purchaseCountThreshold: number | null,
    public readonly spendingThreshold: number | null,
    public readonly rewardType: string,
    public readonly rewardValue: number | null,
    public readonly giftDescription: string | null,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
