"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { cartService } from "../services/cart.service";
import {
  AddToCartInput,
  CartItem,
} from "../types/cart.types";
import { ProductVariant } from "@/modules/catalogue/types/catalogue.types";

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCart = useCallback(async () => {
    try {
      const currentItems = await cartService.getItems();
      setItems(currentItems);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load cart");
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    setItems(cartService.getSyncItems());
    void loadCart();

    const handleCartUpdate = () => {
      void loadCart();
    };

    const eventName = cartService.getUpdatedEventName();

    window.addEventListener(eventName, handleCartUpdate);
    window.addEventListener("storage", handleCartUpdate);

    return () => {
      window.removeEventListener(eventName, handleCartUpdate);
      window.removeEventListener("storage", handleCartUpdate);
    };
  }, [loadCart]);

  const addItem = useCallback(
    async (input: AddToCartInput) => {
      try {
        const updated = await cartService.addItem(input);
        setItems(updated);
        setError(null);
        return updated;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to add product to cart",
        );
        throw err;
      }
    },
    [],
  );

  const updateVariant = useCallback(
    async (itemId: string, variant: ProductVariant) => {
      try {
        const updated = await cartService.updateVariant(itemId, variant);
        setItems(updated);
        setError(null);
        return updated;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to update product variant",
        );
        throw err;
      }
    },
    [],
  );

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      try {
        const updated = await cartService.updateQuantity(itemId, quantity);
        setItems(updated);
        setError(null);
        return updated;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to update product quantity",
        );
        throw err;
      }
    },
    [],
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      try {
        const updated = await cartService.removeItem(itemId);
        setItems(updated);
        setError(null);
        return updated;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to remove item from cart",
        );
        throw err;
      }
    },
    [],
  );

  const clearCart = useCallback(async () => {
    try {
      await cartService.clearCart();
      setItems([]);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to clear cart",
      );
      throw err;
    }
  }, []);

  const itemCount = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total + item.quantity,
        0,
      ),
    [items],
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total +
          (item.variant?.price ?? item.product.price) *
            item.quantity,
        0,
      ),
    [items],
  );

  const deliveryFee =
    items.length > 0 ? 2000 : 0;

  const total = subtotal + deliveryFee;

  return {
    items,
    itemCount,
    subtotal,
    deliveryFee,
    total,
    isReady,
    error,
    addItem,
    updateVariant,
    updateQuantity,
    removeItem,
    clearCart,
    refreshCart: loadCart,
  };
}
