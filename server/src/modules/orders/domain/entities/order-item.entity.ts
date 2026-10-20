export class OrderItemEntity {
  constructor(
    public readonly id: string,
    public readonly orderId: string,
    public readonly variantId: string,
    public readonly quantity: number,
    public readonly unitPrice: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly sku: string | null = null,
    public readonly size: string | null = null,
    public readonly color: string | null = null,
    public readonly productName: string | null = null,
    public readonly imageUrl: string | null = null,
  ) {}
}
