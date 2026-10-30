"use client";

import Link from "next/link";
import { Product, ProductImage } from "@/modules/catalogue/types/catalogue.types";
import { ProductCard } from "@/modules/catalogue/components/product-card";

type FeaturedProductsProps = {
  products: Product[];
  images: ProductImage[];
};

export function FeaturedProducts({ products, images }: FeaturedProductsProps) {
  const featuredProducts = products.slice(0, 6);

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

        {featuredProducts.length > 0 ? (
          <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                image={images.find(
                  (image) =>
                    image.productId === product.id && image.isPrimary,
                )}
              />
            ))}
          </div>
        ) : (
          <p className="mt-5 text-center text-sm text-neutral-400">
            No featured products are available right now.
          </p>
        )}

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
