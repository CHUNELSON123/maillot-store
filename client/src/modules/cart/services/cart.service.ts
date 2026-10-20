import { AddToCartInput, CartItem } from "../types/cart.types";
import {
  Product,
  ProductVariant,
} from "@/modules/catalogue/types/catalogue.types";
import { authStorage } from "@/lib/auth/auth-storage";
import { apiClient } from "@/services/api/api-client";

type CartApiItem = {
  id: string;
  customerId: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string | null;
  };
  variant: {
    id: string;
    sku: string;
    size: string | null;
    color: string | null;
    edition: string | null;
    price: number | null;
  } | null;
};

const CART_STORAGE_KEY = "maillot-store-cart";
const UPDATED_EVENT = "maillot-cart-updated";

let cachedItems: CartItem[] = [];
let cachedToken: string | null = null;
let hasLoaded = false;
let loadingRequest: Promise<CartItem[]> | null = null;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function notifyUpdated(): void {
  if (isBrowser()) {
    window.dispatchEvent(new Event(UPDATED_EVENT));
  }
}

function readGuestCart(): CartItem[] {
  if (!isBrowser()) return [];

  try {
    const storedCart = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!storedCart) return [];

    const parsed = JSON.parse(storedCart);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveGuestCart(items: CartItem[]): void {
  if (!isBrowser()) return;

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  cachedItems = items;
  cachedToken = null;
  hasLoaded = true;
  notifyUpdated();
}

function createCartItemId(
  productId: string,
  variantId?: string | null,
): string {
  return `${productId}-${variantId ?? "default"}`;
}

function mapApiItem(item: CartApiItem): CartItem {
  const variant: ProductVariant | null = item.variant
    ? {
        id: item.variant.id,
        productId: item.productId,
        sku: item.variant.sku,
        size: item.variant.size,
        color: item.variant.color,
        edition: item.variant.edition,
        price: item.variant.price ?? item.product.price,
        status: "ACTIVE",
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }
    : null;

  const product: Product = {
    id: item.product.id,
    categoryId: "",
    brandId: "",
    name: item.product.name,
    description: null,
    price: variant?.price ?? item.product.price,
    status: "ACTIVE",
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };

  return {
    id: item.id,
    product,
    variant,
    imageUrl: item.product.imageUrl,
    quantity: item.quantity,
  };
}

async function fetchAccountCart(token: string): Promise<CartItem[]> {
  const response = await apiClient<CartApiItem[]>("/cart", {
    method: "GET",
    token,
  });

  cachedItems = response.map(mapApiItem);
  cachedToken = token;
  hasLoaded = true;

  return cachedItems;
}

export const cartService = {
  getSyncItems(): CartItem[] {
    const token = authStorage.getToken();
    if (token && hasLoaded && cachedToken === token) {
      return cachedItems;
    }
    return readGuestCart();
  },

  async getItems(): Promise<CartItem[]> {
    const token = authStorage.getToken();

    if (!token) {
      const items = readGuestCart();
      cachedItems = items;
      cachedToken = null;
      hasLoaded = true;
      return items;
    }

    if (hasLoaded && cachedToken === token) {
      return cachedItems;
    }

    if (!loadingRequest) {
      loadingRequest = fetchAccountCart(token).finally(() => {
        loadingRequest = null;
      });
    }

    return loadingRequest;
  },

  async addItem(input: AddToCartInput): Promise<CartItem[]> {
    const token = authStorage.getToken();

    if (!token) {
      const items = readGuestCart();
      const variantId = input.variant?.id ?? null;
      const itemId = createCartItemId(input.product.id, variantId);

      const existingItemIndex = items.findIndex((item) => item.id === itemId);

      if (existingItemIndex >= 0) {
        const updatedItems = [...items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity:
            updatedItems[existingItemIndex].quantity + (input.quantity ?? 1),
        };
        saveGuestCart(updatedItems);
        return updatedItems;
      }

      const newItem: CartItem = {
        id: itemId,
        product: input.product,
        variant: input.variant ?? null,
        imageUrl: input.imageUrl ?? null,
        quantity: input.quantity ?? 1,
      };

      const updatedItems = [...items, newItem];
      saveGuestCart(updatedItems);
      return updatedItems;
    }

    await apiClient<CartApiItem>("/cart/items", {
      method: "POST",
      token,
      body: JSON.stringify({
        productId: input.product.id,
        variantId: input.variant?.id ?? null,
        quantity: input.quantity ?? 1,
      }),
    });

    hasLoaded = false;
    const updatedItems = await fetchAccountCart(token);
    notifyUpdated();
    return updatedItems;
  },

  async updateVariant(
    itemId: string,
    variant: ProductVariant,
  ): Promise<CartItem[]> {
    const token = authStorage.getToken();

    if (!token) {
      const items = readGuestCart();
      const item = items.find((item) => item.id === itemId);

      if (!item) {
        return items;
      }

      if (
        !variant.id ||
        variant.productId !== item.product.id ||
        typeof variant.price !== "number" ||
        !Number.isFinite(variant.price) ||
        variant.price < 0
      ) {
        throw new Error("Please select an available variant for this product.");
      }

      const price = variant.price;
      const updatedId = createCartItemId(item.product.id, variant.id);
      const matchingItem = items.find(
        (other) => other.id === updatedId && other.id !== itemId,
      );

      const updatedItems = items
        .filter((other) => other.id !== matchingItem?.id)
        .map((other) =>
          other.id === itemId
            ? {
                ...other,
                id: updatedId,
                product: { ...other.product, price },
                variant,
                quantity: other.quantity + (matchingItem?.quantity ?? 0),
              }
            : other,
        );

      saveGuestCart(updatedItems);
      return updatedItems;
    }

    await apiClient<CartApiItem>(`/cart/items/${encodeURIComponent(itemId)}`, {
      method: "PUT",
      token,
      body: JSON.stringify({
        variantId: variant.id,
      }),
    });

    hasLoaded = false;
    const updatedItems = await fetchAccountCart(token);
    notifyUpdated();
    return updatedItems;
  },

  async updateQuantity(
    itemId: string,
    quantity: number,
  ): Promise<CartItem[]> {
    const token = authStorage.getToken();

    if (!token) {
      const items = readGuestCart();

      if (quantity <= 0) {
        return this.removeItem(itemId);
      }

      const updatedItems = items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity,
            }
          : item,
      );

      saveGuestCart(updatedItems);
      return updatedItems;
    }

    if (quantity <= 0) {
      return this.removeItem(itemId);
    }

    await apiClient<CartApiItem>(`/cart/items/${encodeURIComponent(itemId)}`, {
      method: "PUT",
      token,
      body: JSON.stringify({
        quantity,
      }),
    });

    hasLoaded = false;
    const updatedItems = await fetchAccountCart(token);
    notifyUpdated();
    return updatedItems;
  },

  async removeItem(itemId: string): Promise<CartItem[]> {
    const token = authStorage.getToken();

    if (!token) {
      const items = readGuestCart();
      const updatedItems = items.filter((item) => item.id !== itemId);
      saveGuestCart(updatedItems);
      return updatedItems;
    }

    await apiClient<void>(`/cart/items/${encodeURIComponent(itemId)}`, {
      method: "DELETE",
      token,
    });

    cachedItems = cachedItems.filter((item) => item.id !== itemId);
    hasLoaded = true;
    notifyUpdated();
    return cachedItems;
  },

  async clearCart(): Promise<void> {
    const token = authStorage.getToken();

    if (!token) {
      saveGuestCart([]);
      return;
    }

    await apiClient<void>("/cart", {
      method: "DELETE",
      token,
    });

    cachedItems = [];
    hasLoaded = true;
    notifyUpdated();
  },

  async syncGuestItems(): Promise<void> {
    const token = authStorage.getToken();
    if (!token) return;

    const guestItems = readGuestCart();
    if (guestItems.length === 0) return;

    try {
      await apiClient<CartApiItem[]>("/cart/sync", {
        method: "POST",
        token,
        body: JSON.stringify({
          items: guestItems.map((item) => ({
            productId: item.product.id,
            variantId: item.variant?.id ?? null,
            quantity: item.quantity,
          })),
        }),
      });

      if (isBrowser()) {
        window.localStorage.removeItem(CART_STORAGE_KEY);
      }
      hasLoaded = false;
      await fetchAccountCart(token);
      notifyUpdated();
    } catch (error) {
      console.error("Failed to sync guest cart to account:", error);
    }
  },

  resetCache(): void {
    cachedItems = [];
    cachedToken = null;
    hasLoaded = false;
  },

  getUpdatedEventName(): string {
    return UPDATED_EVENT;
  },
};
