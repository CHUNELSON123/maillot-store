import {
  Product,
  ProductVariant,
} from "@/modules/catalogue/types/catalogue.types";

export type CartItem = {
  id: string;
  product: Product;
  variant: ProductVariant | null;
  imageUrl: string | null;
  quantity: number;
};

export type CartState = {
  items: CartItem[];
};

export type AddToCartInput = {
  product: Product;
  variant?: ProductVariant | null;
  imageUrl?: string | null;
  quantity?: number;
};