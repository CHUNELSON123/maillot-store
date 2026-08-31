import { apiClient } from "@/services/api/api-client";
import { authStorage } from "@/lib/auth/auth-storage";
import { Category } from "../types/catalogue.types";

function getToken(): string {
  const token = authStorage.getToken();

  if (!token) {
    throw new Error("No authentication token found.");
  }

  return token;
}

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    return apiClient<Category[]>("/categories", {
      method: "GET",
      token: getToken(),
    });
  },

  async getCategory(
    id: string,
  ): Promise<Category> {
    return apiClient<Category>(
      `/categories/${id}`,
      {
        method: "GET",
        token: getToken(),
      },
    );
  },
};