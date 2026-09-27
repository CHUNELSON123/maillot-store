import { OrderItemEntity } from './order-item.entity';

export class OrderEntity {
  constructor(
    public readonly id: string,
    public readonly customerId: string | null,
    public readonly guestName: string | null,
    public readonly guestEmail: string | null,
    public readonly guestPhone: string | null,
    public readonly orderNumber: string,
    public readonly source: string,
    public readonly status: string,
    public readonly totalAmount: number,
    public readonly influencerDiscountAmount: number,
    public readonly items: OrderItemEntity[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
