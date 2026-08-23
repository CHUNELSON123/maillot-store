export class PromotionEntity {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description: string | null,
    public readonly discountType: string,
    public readonly discountValue: number,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
