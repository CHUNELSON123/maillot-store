export class ProductVariantEntity {
  constructor(
    public readonly id: string,
    public readonly productId: string,
    public readonly sku: string,
    public readonly size: string | null,
    public readonly color: string | null,
    public readonly edition: string | null,
    public readonly price: number | null,
    public readonly status: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
