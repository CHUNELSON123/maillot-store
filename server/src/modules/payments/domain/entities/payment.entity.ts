export class PaymentEntity {
  constructor(
    public readonly id: string,
    public readonly orderId: string,
    public readonly paymentMethodId: string,
    public readonly amount: number,
    public readonly status: string,
    public readonly transactionReference: string | null,
    public readonly paidAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
