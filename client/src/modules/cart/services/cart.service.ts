import {
  AddToCartInput,
  CartItem,
} from "../types/cart.types";

const CART_STORAGE_KEY = "maillot-store-cart";

function isBrowser() {
  return typeof window !== "undefined";
}

function readCart(): CartItem[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const storedCart =
      window.localStorage.getItem(
        CART_STORAGE_KEY,
      );

    if (!storedCart) {
      return [];
    }

    const parsed = JSON.parse(storedCart);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(
    CART_STORAGE_KEY,
    JSON.stringify(items),
  );

  window.dispatchEvent(
    new Event("maillot-cart-updated"),
  );
}

function createCartItemId(
  productId: string,
  variantId?: string | null,
) {
  return `${productId}-${variantId ?? "default"}`;
}

export const cartService = {
  getItems(): CartItem[] {
    return readCart();
  },

  addItem(input: AddToCartInput): CartItem[] {
    const items = readCart();

    const variantId =
      input.variant?.id ?? null;

    const itemId = createCartItemId(
      input.product.id,
      variantId,
    );

    const existingItemIndex =
      items.findIndex(
        (item) => item.id === itemId,
      );

    if (existingItemIndex >= 0) {
      const updatedItems = [...items];

      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity:
          updatedItems[existingItemIndex].quantity +
          (input.quantity ?? 1),
      };

      saveCart(updatedItems);

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

    saveCart(updatedItems);

    return updatedItems;
  },

  updateQuantity(
    itemId: string,
    quantity: number,
  ): CartItem[] {
    const items = readCart();

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

    saveCart(updatedItems);

    return updatedItems;
  },

  removeItem(itemId: string): CartItem[] {
    const items = readCart();

    const updatedItems = items.filter(
      (item) => item.id !== itemId,
    );

    saveCart(updatedItems);

    return updatedItems;
  },

  clearCart() {
    saveCart([]);
  },
};