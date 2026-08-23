export class SupplierEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly phone: string | null,
    public readonly email: string | null,
    public readonly address: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
