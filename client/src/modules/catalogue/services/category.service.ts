import { apiClient } from "@/services/api/api-client";
import { Category } from "../types/catalogue.types";

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    return apiClient<Category[]>("/categories", {
      method: "GET",
    });
  },

  async getCategory(
    id: string,
  ): Promise<Category> {
    return apiClient<Category>(
      `/categories/${id}`,
      {
        method: "GET",
      },
    );
  },
};