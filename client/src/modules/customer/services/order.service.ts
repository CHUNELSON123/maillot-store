import { apiClient } from "@/services/api/api-client";
import { authStorage } from "@/lib/auth/auth-storage";
import { Order } from "../types/order.types";

export const orderService = {
  async getOrders(): Promise<Order[]> {
    const token = authStorage.getToken();

    if (!token) {
      throw new Error("No authentication token found.");
    }

    return apiClient<Order[]>("/orders", {
      method: "GET",
      token,
    });
  },

  async getOrder(id: string): Promise<Order> {
    const token = authStorage.getToken();

    if (!token) {
      throw new Error("No authentication token found.");
    }

    return apiClient<Order>(`/orders/${id}`, {
      method: "GET",
      token,
    });
  },
};