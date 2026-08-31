import { apiClient } from "@/services/api/api-client";
import { authStorage } from "@/lib/auth/auth-storage";

import {
  Banner,
  Promotion,
} from "../types/cms.types";

function getToken(): string {
  const token = authStorage.getToken();

  if (!token) {
    throw new Error("No authentication token found.");
  }

  return token;
}

export const cmsService = {
  async getBanners(
    activeOnly = false,
  ): Promise<Banner[]> {
    const query = activeOnly
      ? "?activeOnly=true"
      : "";

    return apiClient<Banner[]>(
      `/cms/banners${query}`,
      {
        method: "GET",
        token: getToken(),
      },
    );
  },

  async getPromotions(
    activeOnly = false,
  ): Promise<Promotion[]> {
    const query = activeOnly
      ? "?activeOnly=true"
      : "";

    return apiClient<Promotion[]>(
      `/cms/promotions${query}`,
      {
        method: "GET",
        token: getToken(),
      },
    );
  },
};