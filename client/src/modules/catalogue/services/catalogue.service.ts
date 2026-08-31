import { apiClient } from "@/services/api/api-client";
import { authStorage } from "@/lib/auth/auth-storage";
import {
  Product,
  ProductDetails,
  ProductImage,
  ProductVariant,
} from "../types/catalogue.types";

function getToken(): string {
  const token = authStorage.getToken();

  if (!token) {
    throw new Error("No authentication token found.");
  }

  return token;
}

export const catalogueService = {
  async getProducts(): Promise<Product[]> {
    return apiClient<Product[]>("/products", {
      method: "GET",
      token: getToken(),
    });
  },

  async getProduct(id: string): Promise<Product> {
    return apiClient<Product>(`/products/${id}`, {
      method: "GET",
      token: getToken(),
    });
  },

  async getProductVariants(
    productId: string,
  ): Promise<ProductVariant[]> {
    return apiClient<ProductVariant[]>(
      `/products/${productId}/variants`,
      {
        method: "GET",
        token: getToken(),
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
        token: getToken(),
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