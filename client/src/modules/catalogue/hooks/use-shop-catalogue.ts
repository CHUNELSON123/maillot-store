"use client";

import { useEffect, useState } from "react";
import { catalogueService } from "../services/catalogue.service";
import { Product, ProductImage } from "../types/catalogue.types";

const PAGE_SIZE = 12;

export function useShopCatalogue(query: {
  page: number;
  categoryId: string;
  search: string;
  sort: string;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError("");

    const timer = window.setTimeout(() => {
      const load = async () => {
        try {
          const result = await catalogueService.getProductsPage({
            page: query.page,
            limit: PAGE_SIZE,
            categoryId: query.categoryId === "all" ? undefined : query.categoryId,
            search: query.search.trim() || undefined,
            sort:
              query.sort === "Price: Low to High"
                ? "price-asc"
                : query.sort === "Price: High to Low"
                  ? "price-desc"
                  : undefined,
          });
          const imageResults = await Promise.all(
            result.items.map((product) =>
              catalogueService.getProductImages(product.id),
            ),
          );
          if (cancelled) return;
          setProducts(result.items);
          setImages(imageResults.flat());
          setTotal(result.total);
          setTotalPages(result.totalPages);
        } catch (loadError) {
          if (cancelled) return;
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load products.",
          );
        } finally {
          if (!cancelled) setIsLoading(false);
        }
      };

      void load();
    }, query.search ? 250 : 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query.categoryId, query.page, query.search, query.sort]);

  return { products, images, total, totalPages, isLoading, error };
}
