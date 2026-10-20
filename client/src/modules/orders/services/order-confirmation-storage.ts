export type OrderConfirmationData = {
  id: string;
  guestAccessToken?: string;
  orderNumber: string;
  orderDate: string;
  orderStatus: string;

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

  paymentMethod: "mtn" | "orange" | "card" | "cash" | "not-recorded";
  paymentStatus: string;

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
  discount: number;
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
      const parsed = JSON.parse(stored) as Partial<OrderConfirmationData>;

      if (
        typeof parsed !== "object" ||
        parsed === null ||
        typeof parsed.id !== "string" ||
        typeof parsed.orderNumber !== "string"
      ) {
        sessionStorage.removeItem(STORAGE_KEY);
        return null;
      }

      return {
        ...parsed,
        orderStatus: parsed.orderStatus ?? "PENDING",
        paymentMethod:
          parsed.paymentStatus === undefined
            ? "not-recorded"
            : (parsed.paymentMethod ?? "not-recorded"),
        paymentStatus: parsed.paymentStatus ?? "NOT_RECORDED",
        discount: parsed.discount ?? 0,
      } as OrderConfirmationData;
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
