export class OrderItemEntity {
  constructor(
    public readonly id: string,
    public readonly orderId: string,
    public readonly variantId: string,
    public readonly quantity: number,
    public readonly unitPrice: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
