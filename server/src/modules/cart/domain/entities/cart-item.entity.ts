export class CartItemEntity {
  constructor(
    public readonly id: string,
    public readonly customerId: string,
    public readonly productId: string,
    public readonly variantId: string | null,
    public readonly quantity: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly product: {
      id: string;
      name: string;
      price: number;
      imageUrl: string | null;
    },
    public readonly variant: {
      id: string;
      sku: string;
      size: string | null;
      color: string | null;
      edition: string | null;
      price: number | null;
    } | null,
  ) {}
}
