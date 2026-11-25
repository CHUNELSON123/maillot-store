"use client";

import Link from "next/link";

import { NewsletterSection } from "@/components/shared/newsletter-section";
import { useCms } from "@/modules/cms/hooks/use-cms";

import { PromotionBanner } from "./promotion-banner";
import { useCatalogue } from "@/modules/catalogue/hooks/use-catalogue";
import { ProductGrid } from "@/modules/catalogue/components/product-grid";
import { promotionAppliesToProduct } from "@/modules/cms/utils/promotion-pricing";

export function PromotionsPageContent() {
  const { promotions, isLoading, error } = useCms();
  const { products, images, isLoading: productsLoading } = useCatalogue();
  const discountedProducts = products.filter((product) => promotions.some((promotion) => promotionAppliesToProduct(product, promotion)));

  return (
    <main className="bg-white text-neutral-950">
      <section className="mx-auto max-w-[1200px] px-4 py-4 sm:px-8 lg:px-5">
        <div className="mb-4 flex items-center gap-1.5 text-[7px] text-neutral-500">
          <Link href="/" className="transition hover:text-[#D4AF37]">
            Home
          </Link>
          <span>›</span>
          <span className="font-semibold text-neutral-950">Promotions</span>
        </div>

        <div className="mb-5">
          <h1 className="text-[17px] font-extrabold uppercase tracking-tight sm:text-[20px]">
            PROMOTIONS
          </h1>
          <p className="mt-1 text-[8px] text-neutral-500 sm:text-[9px]">
            Current offers from MaillotStore.
          </p>
        </div>

        {(isLoading || productsLoading) && (
          <div className="flex min-h-[180px] items-center justify-center">
            <p className="text-[9px] text-neutral-500">Loading promotions...</p>
          </div>
        )}

        {!isLoading && error && (
          <div role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-[9px] text-red-600">
            {error}
          </div>
        )}

        {!isLoading && !error && promotions.length > 0 && <div className="grid grid-cols-1 gap-3 md:grid-cols-2">{promotions.map((promotion) => <PromotionBanner key={promotion.id} promotion={promotion} />)}</div>}

        {!isLoading && !error && promotions.length > 0 && discountedProducts.length > 0 && <section className="mt-8"><header className="mb-4 flex items-center justify-between"><h2 className="text-sm font-extrabold uppercase">Products on promotion</h2><Link href="/shop" className="text-xs font-semibold text-blue-700">Shop all deals</Link></header><ProductGrid products={discountedProducts} images={images} promotions={promotions}/></section>}

        {!isLoading && !productsLoading && !error && promotions.length === 0 && (
          <div className="py-12 text-center text-[9px] text-neutral-500">
            No active promotions are available right now.
          </div>
        )}
      </section>

      <NewsletterSection />
    </main>
  );
}
