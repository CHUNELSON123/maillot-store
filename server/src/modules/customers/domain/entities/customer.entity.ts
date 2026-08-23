export class CustomerEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly phone: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
