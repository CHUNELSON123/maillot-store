import {
  Product,
  ProductImage,
} from "../types/catalogue.types";

import { ProductCard } from "./product-card";

type Props = {
  products: Product[];
  images?: ProductImage[];
  limit?: number;
};

export function ProductGrid({
  products,
  images = [],
  limit,
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
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
      {visibleProducts.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
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