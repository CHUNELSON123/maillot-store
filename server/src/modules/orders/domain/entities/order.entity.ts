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
    public readonly deliveryMethod: string,
    public readonly deliveryFee: number,
    public readonly deliveryAddress: string | null,
    public readonly deliveryCity: string | null,
    public readonly deliveryPostalCode: string | null,
    public readonly payment: {
      id: string;
      amount: number;
      status: string;
      paymentMethodId: string;
      paymentMethod: string;
      paidAt: Date | null;
    } | null,
    public readonly items: OrderItemEntity[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
