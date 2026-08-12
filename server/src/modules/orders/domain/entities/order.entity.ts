import { OrderItemEntity } from './order-item.entity';

export class OrderEntity {
  constructor(
    public readonly id: string,
    public readonly customerId: string,
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
