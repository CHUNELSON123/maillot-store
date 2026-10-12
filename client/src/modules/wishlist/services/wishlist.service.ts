
import type {
  Product,
  ProductImage,
} from "@/modules/catalogue/types/catalogue.types";
import { authStorage } from "@/lib/auth/auth-storage";
import { apiClient } from "@/services/api/api-client";
import { ApiError } from "@/services/api/api-error";
import type { WishlistItem } from "../types/wishlist.types";

type WishlistApiItem = {
  id: string;
  customerId: string;
  productId: string;
  createdAt: string;
  updatedAt: string;
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string | null;
  };
};

const STORAGE_KEY = "maillot-store-wishlist";
const UPDATED_EVENT = "maillot-wishlist-updated";

let cachedItems: WishlistItem[] = [];
let cachedToken: string | null = null;
let hasLoaded = false;
let loadingRequest: Promise<WishlistItem[]> | null = null;

function notifyUpdated(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(UPDATED_EVENT));
  }
}

function readGuestItems(): WishlistItem[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed: unknown = JSON.parse(stored);

    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "items" in parsed &&
      Array.isArray(parsed.items)
    ) {
      return parsed.items as WishlistItem[];
    }
  } catch (error) {
    console.error("Failed to read guest wishlist:", error);
  }

  return [];
}

function saveGuestItems(items: WishlistItem[]): void {
  if (typeof window === "undefined") return;

  localStorage.setItem(STORAGE_KEY, JSON.stringify({ items }));
  cachedItems = items;
  cachedToken = null;
  hasLoaded = true;
  notifyUpdated();
}

function requireToken(): string {
  const token = authStorage.getToken();

  if (!token) {
    throw new Error("Please sign in to manage your account wishlist.");
  }

  return token;
}

function mapApiItem(item: WishlistApiItem): WishlistItem {
  const image: ProductImage | null = item.product.imageUrl
    ? ({
        id: `${item.product.id}-wishlist-image`,
        productId: item.product.id,
        imageUrl: item.product.imageUrl,
        altText: item.product.name,
        isPrimary: true,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      } as ProductImage)
    : null;

  const product = {
    id: item.product.id,
    name: item.product.name,
    price: item.product.price,
    description: null,
    status: "ACTIVE",
    images: image ? [image] : [],
    variants: [],
  } as unknown as Product;

  return {
    product,
    image,
    addedAt: item.createdAt,
  };
}

async function fetchAccountItems(token: string): Promise<WishlistItem[]> {
  const response = await apiClient<WishlistApiItem[]>("/wishlist", {
    method: "GET",
    token,
  });

  cachedItems = response.map(mapApiItem);
  cachedToken = token;
  hasLoaded = true;

  return cachedItems;
}

export const wishlistService = {
  async getItems(): Promise<WishlistItem[]> {
    const token = authStorage.getToken();

    if (!token) {
      const items = readGuestItems();
      cachedItems = items;
      cachedToken = null;
      hasLoaded = true;
      return items;
    }

    if (hasLoaded && cachedToken === token) {
      return cachedItems;
    }

    if (!loadingRequest) {
      loadingRequest = fetchAccountItems(token).finally(() => {
        loadingRequest = null;
      });
    }

    return loadingRequest;
  },

  async addItem(
    product: Product,
    image: ProductImage | null = null,
  ): Promise<WishlistItem[]> {
    const token = authStorage.getToken();

    if (!token) {
      const items = readGuestItems();

      if (items.some((item) => item.product.id === product.id)) {
        cachedItems = items;
        hasLoaded = true;
        return items;
      }

      const updatedItems = [
        ...items,
        {
          product,
          image,
          addedAt: new Date().toISOString(),
        },
      ];

      saveGuestItems(updatedItems);
      return updatedItems;
    }

    await apiClient<WishlistApiItem>(
      `/wishlist/${encodeURIComponent(product.id)}`,
      { method: "POST", token },
    );

    hasLoaded = false;
    const updatedItems = await fetchAccountItems(token);
    notifyUpdated();

    return updatedItems;
  },

  async removeItem(productId: string): Promise<WishlistItem[]> {
    const token = authStorage.getToken();

    if (!token) {
      const updatedItems = readGuestItems().filter(
        (item) => item.product.id !== productId,
      );

      saveGuestItems(updatedItems);
      return updatedItems;
    }

    await apiClient<void>(
      `/wishlist/${encodeURIComponent(productId)}`,
      { method: "DELETE", token },
    );

    cachedItems = cachedItems.filter(
      (item) => item.product.id !== productId,
    );
    cachedToken = token;
    hasLoaded = true;
    notifyUpdated();

    return cachedItems;
  },

  async toggleItem(
    product: Product,
    image: ProductImage | null = null,
  ): Promise<WishlistItem[]> {
    const items = await this.getItems();

    return items.some((item) => item.product.id === product.id)
      ? this.removeItem(product.id)
      : this.addItem(product, image);
  },

  isInWishlist(productId: string): boolean {
    const items = authStorage.getToken()
      ? cachedItems
      : readGuestItems();

    return items.some((item) => item.product.id === productId);
  },

  async clear(): Promise<void> {
    const token = authStorage.getToken();

    if (!token) {
      saveGuestItems([]);
      return;
    }

    const items = await this.getItems();

    for (const item of items) {
      await this.removeItem(item.product.id);
    }
  },

  async syncGuestItems(): Promise<void> {
    const token = requireToken();
    const guestItems = readGuestItems();

    if (guestItems.length === 0) return;

    const accountItems = await fetchAccountItems(token);
    const existingIds = new Set(
      accountItems.map((item) => item.product.id),
    );

    for (const item of guestItems) {
      if (existingIds.has(item.product.id)) continue;

      try {
        await apiClient<WishlistApiItem>(
          `/wishlist/${encodeURIComponent(item.product.id)}`,
          { method: "POST", token },
        );
      } catch (error) {
        // A product already saved to the account is not a merge failure.
        if (!(error instanceof ApiError) || error.statusCode !== 409) {
          throw error;
        }
      }
    }

    localStorage.removeItem(STORAGE_KEY);
    hasLoaded = false;
    await fetchAccountItems(token);
    notifyUpdated();
  },

  getUpdatedEventName(): string {
    return UPDATED_EVENT;
  },
};
