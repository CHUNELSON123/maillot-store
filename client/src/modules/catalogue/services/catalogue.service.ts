import { apiClient } from "@/services/api/api-client";
import {
  Product,
  ProductDetails,
  ProductImage,
  ProductVariant,
} from "../types/catalogue.types";

export const catalogueService = {
  async getProducts(): Promise<Product[]> {
    return apiClient<Product[]>("/products", {
      method: "GET",
    });
  },

  async getProductsPage(query: {
    page: number;
    limit: number;
    categoryId?: string;
    search?: string;
    sort?: "price-asc" | "price-desc" | "name";
  }): Promise<{ items: Product[]; page: number; limit: number; total: number; totalPages: number }> {
    const params = new URLSearchParams({
      page: String(query.page),
      limit: String(query.limit),
    });
    if (query.categoryId) params.set("categoryId", query.categoryId);
    if (query.search) params.set("search", query.search);
    if (query.sort) params.set("sort", query.sort);

    return apiClient(`/products?${params.toString()}`, { method: "GET" });
  },

  async getProduct(id: string): Promise<Product> {
    return apiClient<Product>(`/products/${id}`, {
      method: "GET",
    });
  },

  async getProductVariants(
    productId: string,
  ): Promise<ProductVariant[]> {
    return apiClient<ProductVariant[]>(
      `/products/${productId}/variants`,
      {
        method: "GET",
      },
    );
  },

  async getProductImages(
    productId: string,
  ): Promise<ProductImage[]> {
    return apiClient<ProductImage[]>(
      `/products/${productId}/images`,
      {
        method: "GET",
      },
    );
  },

  async getProductDetails(
    id: string,
  ): Promise<ProductDetails> {
    const [product, variants, images] =
      await Promise.all([
        this.getProduct(id),
        this.getProductVariants(id),
        this.getProductImages(id),
      ]);

    return {
      ...product,
      variants,
      images,
    };
  },
};
