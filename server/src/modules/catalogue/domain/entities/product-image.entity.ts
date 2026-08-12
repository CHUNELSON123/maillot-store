export class ProductImageEntity {
  constructor(
    public readonly id: string,
    public readonly productId: string,
    public readonly imageUrl: string,
    public readonly altText: string | null,
    public readonly isPrimary: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
