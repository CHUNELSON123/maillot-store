export interface OrderItem {
  id: string;
  orderId: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  createdAt: string;
  updatedAt: string;
  sku?: string | null;
  size?: string | null;
  color?: string | null;
  productName?: string | null;
  imageUrl?: string | null;
}

export interface Order {
  id: string;
  customerId: string | null;
  guestName?: string | null;
  guestEmail?: string | null;
  guestPhone?: string | null;
  orderNumber: string;
  source: string;
  status: string;
  totalAmount: number;
  influencerDiscountAmount: number;
  deliveryMethod?: string;
  deliveryFee?: number;
  deliveryAddress?: string | null;
  deliveryCity?: string | null;
  deliveryPostalCode?: string | null;
  payment?: {
    id: string;
    amount: number;
    status: string;
    paymentMethodId: string;
    paymentMethod: string;
    paidAt: string | null;
  } | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}
