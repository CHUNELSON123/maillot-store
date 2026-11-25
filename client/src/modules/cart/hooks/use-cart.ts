"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { cartService } from "../services/cart.service";
import { authStorage } from "@/lib/auth/auth-storage";
import {
  AddToCartInput,
  CartItem,
} from "../types/cart.types";
import { ProductVariant } from "@/modules/catalogue/types/catalogue.types";
import { cmsService } from "@/modules/cms/services/cms.service";
import { referralAttributionStorage } from "@/modules/influencers/services/influencer.service";

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storeSettings, setStoreSettings] = useState<Record<string, string>>({});
  const [customerDiscountRate, setCustomerDiscountRate] = useState(0);

  const loadCart = useCallback(async () => {
    const token = authStorage.getStorefrontToken();
    try {
      const currentItems = await cartService.getItems();
      if (authStorage.getStorefrontToken() !== token) return;
      setItems(currentItems);
      setError(null);
    } catch (err) {
      if (authStorage.getStorefrontToken() !== token) return;
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
    window.addEventListener("maillot-auth-updated", handleCartUpdate);

    return () => {
      window.removeEventListener(eventName, handleCartUpdate);
      window.removeEventListener("storage", handleCartUpdate);
      window.removeEventListener("maillot-auth-updated", handleCartUpdate);
    };
  }, [loadCart]);

  useEffect(() => {
    let mounted = true;
    void cmsService.getPublicContent().then((content) => { if (mounted) setStoreSettings(content); }).catch(() => undefined);
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const syncAttribution = () => {
      const attribution = referralAttributionStorage.get();
      const rate = Number(attribution?.customerDiscountRate ?? 0);
      setCustomerDiscountRate(Number.isFinite(rate) && rate > 0 && rate <= 100 ? rate : 0);
    };
    syncAttribution();
    window.addEventListener("maillot-referral-attribution-updated", syncAttribution);
    window.addEventListener("storage", syncAttribution);
    return () => {
      window.removeEventListener("maillot-referral-attribution-updated", syncAttribution);
      window.removeEventListener("storage", syncAttribution);
    };
  }, []);

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

  const customerDiscountAmount = Math.round(subtotal * customerDiscountRate) / 100;
  const amountBeforeDelivery = Math.max(0, subtotal - customerDiscountAmount);

  const deliveryEnabled = storeSettings["store.delivery_enabled"] !== "false";
  const configuredFee = Number(storeSettings["store.delivery_fee"]);
  const configuredThreshold = Number(storeSettings["store.free_delivery_threshold"]);
  const deliveryRate = Number.isFinite(configuredFee) && configuredFee >= 0 ? configuredFee : 2000;
  const freeDeliveryThreshold = storeSettings["store.free_delivery_threshold"] === undefined
    ? 50000
    : Number.isFinite(configuredThreshold) && configuredThreshold >= 0 ? configuredThreshold : 50000;
  const freeDelivery = freeDeliveryThreshold > 0 && amountBeforeDelivery >= freeDeliveryThreshold;
  const deliveryFee = items.length > 0 && deliveryEnabled && !freeDelivery ? deliveryRate : 0;

  const total = amountBeforeDelivery + deliveryFee;

  return {
    items,
    itemCount,
    subtotal,
    customerDiscountRate,
    customerDiscountAmount,
    deliveryFee,
    deliveryEnabled,
    freeDeliveryThreshold,
    freeDelivery,
    deliveryRate,
    deliveryInformation: storeSettings["store.delivery_information"] ?? "",
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
