export class CommissionEntity {
  constructor(
    public readonly id: string,
    public readonly influencerId: string,
    public readonly referralId: string | null,
    public readonly amount: number,
    public readonly status: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
