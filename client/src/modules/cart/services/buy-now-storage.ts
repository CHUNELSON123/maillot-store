import type { CartItem } from "../types/cart.types";

const KEY = "maillot-buy-now";

export const buyNowStorage = {
  save(item: CartItem): void {
    sessionStorage.setItem(KEY, JSON.stringify(item));
  },
  get(): CartItem | null {
    try {
      const raw = sessionStorage.getItem(KEY);
      if (!raw) return null;
      const item = JSON.parse(raw) as CartItem;
      if (!item?.product?.id || !item.variant?.id || !Number.isSafeInteger(item.quantity) || item.quantity < 1 || typeof item.variant.price !== "number" || !Number.isFinite(item.variant.price)) return null;
      return item;
    } catch {
      return null;
    }
  },
  clear(): void {
    sessionStorage.removeItem(KEY);
  },
};
