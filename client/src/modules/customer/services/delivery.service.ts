import { apiClient } from "@/services/api/api-client";
import { authStorage } from "@/lib/auth/auth-storage";

export type CustomerDelivery = {
  id: string;
  orderId: string;
  deliveryStatus: string;
  address: string;
  trackingNumber: string | null;
  provider: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export const deliveryService = {
  async getForOrder(orderId: string): Promise<CustomerDelivery> {
    const token = authStorage.getToken();
    if (!token) throw new Error("No authentication token found.");

    return apiClient<CustomerDelivery>(
      `/deliveries/${encodeURIComponent(orderId)}`,
      { method: "GET", token },
    );
  },
};
