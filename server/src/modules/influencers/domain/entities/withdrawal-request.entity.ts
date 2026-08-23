export class WithdrawalRequestEntity {
  constructor(
    public readonly id: string,
    public readonly influencerId: string,
    public readonly amount: number,
    public readonly status: string,
    public readonly paymentReference: string | null,
    public readonly processedAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
