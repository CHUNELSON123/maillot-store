
"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  Product,
  ProductImage,
} from "@/modules/catalogue/types/catalogue.types";
import type { WishlistItem } from "../types/wishlist.types";
import { wishlistService } from "../services/wishlist.service";

export function useWishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshWishlist = useCallback(async () => {
    try {
      const updatedItems = await wishlistService.getItems();
      setItems(updatedItems);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your wishlist.",
      );
    } finally {
      setIsReady(true);
    }
  }, []);

  
useEffect(() => {
  void refreshWishlist();

  const eventName = wishlistService.getUpdatedEventName();
  const handleUpdate = () => {
    void refreshWishlist();
  };

  window.addEventListener(eventName, handleUpdate);
  window.addEventListener("storage", handleUpdate);

  return () => {
    window.removeEventListener(eventName, handleUpdate);
    window.removeEventListener("storage", handleUpdate);
  };
}, [refreshWishlist]);


  const addItem = useCallback(
    async (product: Product, image: ProductImage | null = null) => {
      try {
        const updatedItems = await wishlistService.addItem(product, image);
        setItems(updatedItems);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to add this product.",
        );
        throw err;
      }
    },
    [],
  );

  const removeItem = useCallback(async (productId: string) => {
    try {
      const updatedItems = await wishlistService.removeItem(productId);
      setItems(updatedItems);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to remove this product.",
      );
      throw err;
    }
  }, []);

  const toggleItem = useCallback(
    async (product: Product, image: ProductImage | null = null) => {
      try {
        const updatedItems = await wishlistService.toggleItem(product, image);
        setItems(updatedItems);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to update your wishlist.",
        );
        throw err;
      }
    },
    [],
  );

  const isInWishlist = useCallback(
    (productId: string) =>
      items.some((item) => item.product.id === productId),
    [items],
  );

  const clearWishlist = useCallback(async () => {
    try {
      await wishlistService.clear();
      setItems([]);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to clear your wishlist.",
      );
      throw err;
    }
  }, []);

  return {
    items,
    itemCount: items.length,
    isReady,
    error,
    addItem,
    removeItem,
    toggleItem,
    isInWishlist,
    clearWishlist,
    refreshWishlist,
  };
}
