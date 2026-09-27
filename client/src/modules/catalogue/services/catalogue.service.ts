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