import {
  Product,
  ProductImage,
} from "../types/catalogue.types";

import { ProductCard } from "./product-card";
import { Promotion } from "@/modules/cms/types/cms.types";

type Props = {
  products: Product[];
  images?: ProductImage[];
  limit?: number;
  promotions?: Promotion[];
};

export function ProductGrid({
  products,
  images = [],
  limit,
  promotions = [],
}: Props) {
  const visibleProducts =
    limit !== undefined
      ? products.slice(0, limit)
      : products;

  if (visibleProducts.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-neutral-500">
        No products available.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
      {visibleProducts.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          promotions={promotions}
          image={images.find(
            (image) =>
              image.productId === product.id &&
              image.isPrimary,
          )}
        />
      ))}
    </div>
  );
}
