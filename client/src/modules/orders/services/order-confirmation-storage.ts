export type OrderConfirmationData = {
  id: string;
  orderNumber: string;
  orderDate: string;

  customer: {
    fullName: string;
    email: string;
    phone: string;
  };

  delivery: {
    method: "delivery" | "pickup";
    address: string;
    city: string;
    postalCode: string;
  };

  paymentMethod: "mtn" | "orange" | "card" | "cash";

  items: Array<{
    id: string;
    product: {
      id: string;
      name: string;
      price: number;
    };
    variant: {
      id: string;
      size: string | null;
      color: string | null;
      sku: string;
    } | null;
    imageUrl: string | null;
    quantity: number;
  }>;

  subtotal: number;
  deliveryFee: number;
  total: number;
};

const STORAGE_KEY = "maillot-order-confirmation";

export const orderConfirmationStorage = {
  save(data: OrderConfirmationData) {
    if (typeof window === "undefined") {
      return;
    }

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  get(): OrderConfirmationData | null {
    if (typeof window === "undefined") {
      return null;
    }

    const stored = sessionStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored) as OrderConfirmationData;
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
  },

  clear() {
    if (typeof window === "undefined") {
      return;
    }

    sessionStorage.removeItem(STORAGE_KEY);
  },
};