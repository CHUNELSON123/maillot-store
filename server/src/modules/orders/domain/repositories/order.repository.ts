import { OrderEntity } from '../entities/order.entity';

export interface CreateOrderItemData {
  variantId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateOrderData {
  customerId: string;
  orderNumber: string;
  source: string;
  status: string;
  totalAmount: number;
  influencerDiscountAmount?: number;
  items: CreateOrderItemData[];
}

export interface UpdateOrderStatusData {
  status: string;
}

export abstract class OrderRepository {
  abstract create(data: CreateOrderData): Promise<OrderEntity>;

  abstract findById(
    orderId: string,
    customerId?: string,
  ): Promise<OrderEntity | null>;

  abstract findByCustomer(customerId: string): Promise<OrderEntity[]>;

  abstract updateStatus(
    orderId: string,
    data: UpdateOrderStatusData,
  ): Promise<OrderEntity>;
}
