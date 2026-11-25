import { apiClient } from "@/services/api/api-client";

import {
  Banner,
  Promotion,
} from "../types/cms.types";

export const cmsService = {
  async getPublicContent(): Promise<Record<string, string>> {
    return apiClient<Record<string, string>>("/cms/public/content", { method: "GET" });
  },
  async getBanners(): Promise<Banner[]> {
    return apiClient<Banner[]>(
      "/cms/public/banners",
      {
        method: "GET",
      },
    );
  },

  async getPromotions(): Promise<Promotion[]> {
    return apiClient<Promotion[]>(
      "/cms/public/promotions",
      {
        method: "GET",
      },
    );
  },
};
