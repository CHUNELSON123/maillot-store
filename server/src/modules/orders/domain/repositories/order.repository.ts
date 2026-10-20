import { OrderEntity } from '../entities/order.entity';

export interface CreateOrderItemData {
  variantId: string;
  quantity: number;
  unitPrice: number;
}
export interface CreateOrderData {
  customerId?: string | null;

  guestName?: string | null;
  guestEmail?: string | null;
  guestPhone?: string | null;
  guestAccessToken?: string | null;

  orderNumber: string;
  source: string;
  status: string;
  totalAmount: number;
  referralCode?: string | null;
  referralAttributionToken?: string | null;
  paymentMethod: 'mtn' | 'orange' | 'card' | 'cash';

  deliveryMethod: 'DELIVERY' | 'PICKUP';
  deliveryFee: number;
  deliveryAddress?: string | null;
  deliveryCity?: string | null;
  deliveryPostalCode?: string | null;

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

  abstract findGuestByIdWithToken(
    orderId: string,
    guestAccessToken: string,
  ): Promise<OrderEntity | null>;

  abstract findByCustomer(customerId: string): Promise<OrderEntity[]>;

  abstract findByOrderNumber(
    customerId: string,
    orderNumber: string,
  ): Promise<OrderEntity | null>;

  abstract updateStatus(
    orderId: string,
    data: UpdateOrderStatusData,
  ): Promise<OrderEntity>;
}
