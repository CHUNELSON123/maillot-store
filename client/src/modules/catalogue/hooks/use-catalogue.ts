"use client";

import { useCallback, useEffect, useState } from "react";
import { catalogueService } from "../services/catalogue.service";
import {
  Product,
  ProductDetails,
  ProductImage,
} from "../types/catalogue.types";

export function useCatalogue() {
  const [products, setProducts] = useState<Product[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProducts = useCallback(async () => {
    try {
      setError("");
      setIsLoading(true);

      const products =
        await catalogueService.getProducts();

      const imageResults = await Promise.all(
        products.map((product) =>
          catalogueService.getProductImages(product.id),
        ),
      );

      setProducts(products);
      setImages(imageResults.flat());
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load products.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  return {
    products,
    images,
    isLoading,
    error,
    reload: loadProducts,
  };
}

export function useProduct(id: string) {
  const [product, setProduct] =
    useState<ProductDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProduct = useCallback(async () => {
    try {
      setError("");
      setIsLoading(true);

      const data =
        await catalogueService.getProductDetails(id);

      setProduct(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load product.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadProduct();
  }, [loadProduct]);

  return {
    product,
    isLoading,
    error,
    reload: loadProduct,
  };
}