export interface OrderItem {
  id: string;
  orderId: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  customerId: string;
  orderNumber: string;
  source: string;
  status: string;
  totalAmount: number;
  influencerDiscountAmount: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}