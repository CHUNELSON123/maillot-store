export class BannerEntity {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly imageUrl: string,
    public readonly linkUrl: string | null,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
