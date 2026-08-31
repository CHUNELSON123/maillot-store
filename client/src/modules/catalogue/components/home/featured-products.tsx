"use client";

import Link from "next/link";

import {
  Product,
  ProductImage,
} from "@/modules/catalogue/types/catalogue.types";

import { ProductCard } from "@/modules/catalogue/components/product-card";

type FeaturedProductsProps = {
  products: Product[];
  images: ProductImage[];
};

const fallbackProducts: Product[] = [
  {
    id: "chiefs-jersey",
    categoryId: "nfl",
    brandId: "maillot",
    name: "Kansas City Chiefs Jersey",
    description: null,
    price: 28000,
    status: "ACTIVE",
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "lakers-jersey",
    categoryId: "nba",
    brandId: "maillot",
    name: "Los Angeles Lakers Jersey",
    description: null,
    price: 25000,
    status: "ACTIVE",
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "cowboys-jersey",
    categoryId: "nfl",
    brandId: "maillot",
    name: "Dallas Cowboys Jersey",
    description: null,
    price: 30000,
    status: "ACTIVE",
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "bulls-jersey",
    categoryId: "nba",
    brandId: "maillot",
    name: "Chicago Bulls Jersey",
    description: null,
    price: 23000,
    status: "ACTIVE",
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "warriors-jersey",
    categoryId: "nba",
    brandId: "maillot",
    name: "Golden State Warriors Jersey",
    description: null,
    price: 25000,
    status: "ACTIVE",
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "celtics-jersey",
    categoryId: "nba",
    brandId: "maillot",
    name: "Boston Celtics Jersey",
    description: null,
    price: 25000,
    status: "ACTIVE",
    createdAt: "",
    updatedAt: "",
  },
];

const productDisplay = [
  {
    badge: "NEW",
  },
  {
    discountPercentage: 10,
    originalPrice: 28000,
  },
  {
    badge: "NEW",
  },
  {
    discountPercentage: 15,
    originalPrice: 27000,
  },
  {
    badge: "NEW",
  },
  {
    discountPercentage: 15,
    originalPrice: 29000,
  },
];

export function FeaturedProducts({
  products,
  images,
}: FeaturedProductsProps) {
  const featuredProducts =
    products.length > 0
      ? products.slice(0, 6)
      : fallbackProducts;

  return (
    <section className="bg-[#090909] px-3 py-2 text-white min-[380px]:px-4 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex items-center justify-center gap-3">
          <span className="h-px w-7 bg-[#D4AF37] min-[380px]:w-10 sm:w-16" />

          <h2 className="whitespace-nowrap text-[13px] font-extrabold uppercase tracking-wide sm:text-[17px]">
            FEATURED PRODUCTS
          </h2>

          <span className="h-px w-7 bg-[#D4AF37] min-[380px]:w-10 sm:w-16" />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
          {featuredProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              image={images.find(
                (image) =>
                  image.productId === product.id &&
                  image.isPrimary,
              )}
              badge={productDisplay[index]?.badge ?? null}
              discountPercentage={
                productDisplay[index]?.discountPercentage ??
                null
              }
              originalPrice={
                productDisplay[index]?.originalPrice ?? null
              }
            />
          ))}
        </div>

        <div className="mt-2.5 flex justify-center">
          <Link
            href="/shop"
            className="inline-flex h-7 min-w-[155px] items-center justify-center rounded-[2px] border border-[#D4AF37] px-7 text-[8px] font-extrabold uppercase tracking-wide text-[#D4AF37] transition hover:bg-[#D4AF37] hover:text-black"
          >
            VIEW ALL PRODUCTS
          </Link>
        </div>
      </div>
    </section>
  );
}
