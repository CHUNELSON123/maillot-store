export class DeliveryEntity {
  constructor(
    public readonly id: string,
    public readonly orderId: string,
    public readonly deliveryStatus: string,
    public readonly address: string,
    public readonly trackingNumber: string | null,
    public readonly provider: string | null,
    public readonly deliveredAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
