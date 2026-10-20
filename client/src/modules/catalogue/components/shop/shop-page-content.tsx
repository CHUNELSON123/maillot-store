"use client";

import { useState } from "react";

import { CustomerLayout } from "@/components/layout/customer-layout";
import { NewsletterSection } from "@/components/shared/newsletter-section";
import { useCategories } from "@/modules/catalogue/hooks/use-categories";
import { useShopCatalogue } from "@/modules/catalogue/hooks/use-shop-catalogue";
import { ProductGrid } from "@/modules/catalogue/components/product-grid";

import { ShopCategories } from "./shop-categories";
import { ShopFilters } from "./shop-filters";
import { ShopHero } from "./shop-hero";

export function ShopPageContent() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [sort, setSort] = useState("Featured");
  const [page, setPage] = useState(1);
  const { categories, error: categoriesError } = useCategories();
  const { products, images, total, totalPages, isLoading, error } =
    useShopCatalogue({ page, categoryId, search, sort });

  const clearFilters = () => {
    setSearch("");
    setCategoryId("all");
    setSort("Featured");
    setPage(1);
  };

  return (
    <CustomerLayout>
      <main className="min-h-screen bg-white text-neutral-950">
        <ShopHero />
        <section className="mx-auto max-w-6xl px-5 pt-6 sm:px-8">
          <ShopFilters
            search={search}
            sort={sort}
            onSearchChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            onSortChange={(value) => {
              setSort(value);
              setPage(1);
            }}
            onClear={clearFilters}
          />

          <ShopCategories
            categories={categories}
            selectedCategoryId={categoryId}
            onCategoryChange={(value) => {
              setCategoryId(value);
              setPage(1);
            }}
          />

          {categoriesError && (
            <p role="status" className="-mt-3 pb-4 text-xs text-amber-700">
              Categories are unavailable; showing all products.
            </p>
          )}

          <div className="pb-12">
            {isLoading && (
              <div className="py-20 text-center text-sm text-neutral-500">
                Loading products...
              </div>
            )}
            {!isLoading && error && (
              <div role="alert" className="border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
                {error}
              </div>
            )}
            {!isLoading && !error && (
              <>
                <p className="mb-4 text-xs text-neutral-500">
                  {total === 0
                    ? "No products found."
                    : `Showing ${(page - 1) * 12 + 1}–${Math.min(page * 12, total)} of ${total} products`}
                </p>
                <ProductGrid products={products} images={images} />
                {totalPages > 1 && (
                  <nav aria-label="Product pages" className="mt-8 flex items-center justify-center gap-4">
                    <button
                      type="button"
                      disabled={page <= 1 || isLoading}
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                      className="rounded border border-neutral-300 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <span aria-live="polite" className="text-sm text-neutral-600">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={page >= totalPages || isLoading}
                      onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                      className="rounded border border-neutral-300 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                    </button>
                  </nav>
                )}
              </>
            )}
          </div>
        </section>
        <NewsletterSection />
      </main>
    </CustomerLayout>
  );
}
