"use client";

import Link from "next/link";
import { useMemo } from "react";

import { NewsletterSection } from "@/components/shared/newsletter-section";
import { useCatalogue } from "@/modules/catalogue/hooks/use-catalogue";

import { ProductCard } from "../product-card";
import { PromotionBanner } from "./promotion-banner";

export function PromotionsPageContent() {
  const {
    products,
    images,
    isLoading,
    error,
  } = useCatalogue();

  const bestDeals = useMemo(() => {
    return products.slice(0, 4);
  }, [products]);

  return (
    <main className="bg-white text-neutral-950">
      <section className="mx-auto max-w-[1200px] px-4 py-4 sm:px-8 lg:px-5">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-1.5 text-[7px] text-neutral-500">
          <Link
            href="/"
            className="transition hover:text-[#D4AF37]"
          >
            Home
          </Link>

          <span>›</span>

          <span className="font-semibold text-neutral-950">
            Promotions
          </span>
        </div>

        {/* Page heading */}
        <div className="mb-4">
          <h1 className="text-[17px] font-extrabold uppercase tracking-tight sm:text-[20px]">
            PROMOTIONS
          </h1>

          <p className="mt-1 text-[8px] text-neutral-500 sm:text-[9px]">
            Grab the best deals on your favorite sports gear.
          </p>
        </div>

        {/* Promotion banners */}
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-[1.65fr_0.95fr]">
          <PromotionBanner variant="main" />

          <div className="grid grid-rows-2 gap-2.5">
            <PromotionBanner variant="training" />
            <PromotionBanner variant="footwear" />
          </div>
        </div>

        {/* Best Deals */}
        <section className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-[12px] font-extrabold uppercase sm:text-[14px]">
              BEST DEALS
            </h2>

            <Link
              href="/shop"
              className="text-[7px] font-semibold text-neutral-500 transition hover:text-[#D4AF37] sm:text-[8px]"
            >
              View All Deals
            </Link>
          </div>

          {isLoading && (
            <div className="flex min-h-[180px] items-center justify-center">
              <p className="text-[9px] text-neutral-500">
                Loading deals...
              </p>
            </div>
          )}

          {!isLoading && error && (
            <div className="border border-red-200 bg-red-50 px-4 py-3 text-[9px] text-red-600">
              {error}
            </div>
          )}

          {!isLoading &&
            !error &&
            bestDeals.length > 0 && (
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
                {bestDeals.map((product) => {
                  const image =
                    images.find(
                      (item) =>
                        item.productId === product.id &&
                        item.isPrimary,
                    ) ??
                    images.find(
                      (item) =>
                        item.productId === product.id,
                    );

                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      image={image}
                    />
                  );
                })}
              </div>
            )}

          {!isLoading &&
            !error &&
            bestDeals.length === 0 && (
              <div className="py-12 text-center text-[9px] text-neutral-500">
                No promotional products available.
              </div>
            )}
        </section>
      </section>

      {/* Shared newsletter */}
      <NewsletterSection />
    </main>
  );
}