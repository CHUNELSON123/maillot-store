
import type {
  Product,
  ProductImage,
} from "@/modules/catalogue/types/catalogue.types";

export type WishlistItem = {
  product: Product;
  image: ProductImage | null;
  addedAt: string;
};

export type WishlistState = {
  items: WishlistItem[];
};
