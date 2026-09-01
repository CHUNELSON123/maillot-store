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

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isReady, setIsReady] = useState(false);

  const loadCart = useCallback(() => {
    setItems(cartService.getItems());
    setIsReady(true);
  }, []);

  useEffect(() => {
    loadCart();

    const handleCartUpdate = () => {
      loadCart();
    };

    window.addEventListener(
      "maillot-cart-updated",
      handleCartUpdate,
    );

    window.addEventListener(
      "storage",
      handleCartUpdate,
    );

    return () => {
      window.removeEventListener(
        "maillot-cart-updated",
        handleCartUpdate,
      );

      window.removeEventListener(
        "storage",
        handleCartUpdate,
      );
    };
  }, [loadCart]);

  const addItem = useCallback(
    (input: AddToCartInput) => {
      setItems(cartService.addItem(input));
    },
    [],
  );

  const updateQuantity = useCallback(
    (itemId: string, quantity: number) => {
      setItems(
        cartService.updateQuantity(
          itemId,
          quantity,
        ),
      );
    },
    [],
  );

  const removeItem = useCallback(
    (itemId: string) => {
      setItems(
        cartService.removeItem(itemId),
      );
    },
    [],
  );

  const clearCart = useCallback(() => {
    cartService.clearCart();
    setItems([]);
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
          item.product.price *
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
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  };
}