import { apiClient } from "@/services/api/api-client";
import { authStorage } from "@/lib/auth/auth-storage";
import { Notification } from "../types/notification.types";

function getToken(): string {
  const token = authStorage.getToken();

  if (!token) {
    throw new Error("No authentication token found.");
  }

  return token;
}

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    return apiClient<Notification[]>("/notifications", {
      method: "GET",
      token: getToken(),
    });
  },

  async markAsRead(id: string): Promise<Notification> {
    return apiClient<Notification>(
      `/notifications/${id}/read`,
      {
        method: "PATCH",
        token: getToken(),
      },
    );
  },

  async markAllAsRead(): Promise<void> {
    await apiClient<void>("/notifications/read-all", {
      method: "PATCH",
      token: getToken(),
    });
  },
};