import { apiClient } from "@/services/api/api-client";

import {
  Banner,
  Promotion,
} from "../types/cms.types";

export const cmsService = {
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
