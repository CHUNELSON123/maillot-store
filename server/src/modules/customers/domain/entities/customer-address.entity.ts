export class CustomerAddressEntity {
  constructor(
    public readonly id: string,
    public readonly customerId: string,
    public readonly address: string,
    public readonly city: string,
    public readonly region: string | null,
    public readonly country: string,
    public readonly isDefault: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
