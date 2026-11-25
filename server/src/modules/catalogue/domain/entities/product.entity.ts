export class ProductEntity {
  constructor(
    public readonly id: string,
    public readonly categoryId: string,
    public readonly brandId: string | null,
    public readonly name: string,
    public readonly description: string | null,
    public readonly season: string | null,
    public readonly edition: string | null,
    public readonly price: number,
    public readonly status: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
