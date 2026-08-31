"use client";

import { HomeHero } from "./home-hero";
import { HomeCategories } from "./home-categories";
import { FeaturedProducts } from "./featured-products";
import { HomePromotion } from "./home-promotion";
import { ShopBenefits } from "./shop-benefits";
import { InfluencerSection } from "./influencer-section";
import { SocialSection } from "./social-section";

import { NewsletterSection } from "@/components/shared/newsletter-section";

import { useCatalogue } from "@/modules/catalogue/hooks/use-catalogue";
import { useCategories } from "@/modules/catalogue/hooks/use-categories";
import { useCms } from "@/modules/cms/hooks/use-cms";

export function HomePageContent() {
  const {
    products,
    images,
    isLoading: productsLoading,
    error: productsError,
  } = useCatalogue();

  const {
    categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useCategories();

  const {
    banners,
    promotions,
    isLoading: cmsLoading,
    error: cmsError,
  } = useCms();

  const heroBanner = banners[0];
  const promotion = promotions[0];

  const isLoading =
    productsLoading ||
    categoriesLoading ||
    cmsLoading;

  const error =
    productsError ||
    categoriesError ||
    cmsError;

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <HomeHero banner={heroBanner} />

      {isLoading && (
        <div className="mx-auto max-w-[1200px] px-3 py-4 min-[380px]:px-4 sm:px-8 lg:px-10">
          <p className="border border-[#3a2d08] bg-black/40 px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-[#D4AF37]">
            Loading store content...
          </p>
        </div>
      )}

      {error && (
        <div className="mx-auto max-w-[1200px] px-3 py-3 min-[380px]:px-4 sm:px-8 lg:px-10">
          <div className="border border-[#5f4600] bg-black/40 px-3 py-2 text-[10px] text-neutral-300">
            Live store content is unavailable right now, so preview content is shown.
          </div>
        </div>
      )}

      <HomeCategories categories={categories} />

      <FeaturedProducts
        products={products.slice(0, 6)}
        images={images}
      />

      <HomePromotion
        promotion={promotion}
        banner={banners[1]}
      />

      <ShopBenefits />

      <div className="bg-[#090909] px-3 py-1 min-[380px]:px-4 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-2 lg:grid-cols-2">
          <InfluencerSection />
          <SocialSection />
        </div>
      </div>

      <NewsletterSection />
    </main>
  );
}
