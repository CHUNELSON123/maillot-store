export class InventoryEntity {
  constructor(
    public readonly id: string,
    public readonly variantId: string,
    public readonly quantity: number,
    public readonly minStock: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
