export class PurchaseItemEntity {
  constructor(
    public readonly id: string,
    public readonly purchaseId: string,
    public readonly variantId: string,
    public readonly quantity: number,
    public readonly unitCost: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
