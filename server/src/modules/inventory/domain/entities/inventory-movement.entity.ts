export class InventoryMovementEntity {
  constructor(
    public readonly id: string,
    public readonly variantId: string,
    public readonly quantity: number,
    public readonly movementType: string,
    public readonly reference: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
