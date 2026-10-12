export class WishlistItemEntity {
  constructor(
    public readonly id: string,
    public readonly customerId: string,
    public readonly productId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly product: {
      id: string;
      name: string;
      price: number;
      imageUrl: string | null;
    },
  ) {}
}