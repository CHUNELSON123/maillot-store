"use client";

import { useMemo, useState } from "react";

import { CustomerLayout } from "@/components/layout/customer-layout";
import { useCatalogue } from "@/modules/catalogue/hooks/use-catalogue";
import { ProductGrid } from "@/modules/catalogue/components/product-grid";
import { NewsletterSection } from "@/components/shared/newsletter-section";

import { ShopHero } from "./shop-hero";
import { ShopFilters } from "./shop-filters";
import { ShopCategories } from "./shop-categories";

export function ShopPageContent() {
  const {
    products,
    images,
    isLoading,
    error,
  } = useCatalogue();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("Featured");

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter((product) =>
        `${product.name} ${product.description ?? ""}`
          .toLowerCase()
          .includes(query),
      );
    }

    if (category !== "All") {
      result = result.filter((product) =>
        product.description
          ?.toLowerCase()
          .includes(category.toLowerCase()),
      );
    }

    if (sort === "Price: Low to High") {
      result.sort((a, b) => a.price - b.price);
    }

    if (sort === "Price: High to Low") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, search, category, sort]);

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setSort("Featured");
  };

  return (
    <CustomerLayout>
      <main className="min-h-screen bg-white text-neutral-950">
        <ShopHero />

        <section className="mx-auto max-w-6xl px-5 pt-6 sm:px-8">
          <ShopFilters
            search={search}
            sort={sort}
            onSearchChange={setSearch}
            onSortChange={setSort}
            onClear={clearFilters}
          />

          <ShopCategories
            selectedCategory={category}
            onCategoryChange={setCategory}
          />

          <div className="pb-12">
            {isLoading && (
              <div className="py-20 text-center text-sm text-neutral-500">
                Loading products...
              </div>
            )}

            {!isLoading && error && (
              <div className="border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
                {error}
              </div>
            )}

            {!isLoading && !error && (
              <ProductGrid
                products={filteredProducts}
                images={images}
              />
            )}

            {!isLoading &&
              !error &&
              filteredProducts.length > 0 && (
                <div className="mt-6 flex flex-col items-center gap-5">
                  <button
                    type="button"
                    className="flex h-11 min-w-80 items-center justify-center border border-neutral-400 text-sm font-semibold hover:bg-neutral-50"
                  >
                    LOAD MORE PRODUCTS
                  </button>

                  <div className="flex items-center gap-7 text-sm">
                    <button className="border-b-2 border-[#D4AF37] pb-1 font-semibold">
                      1
                    </button>

                    <button>2</button>
                    <button>3</button>
                    <button>4</button>
                    <button>5</button>
                    <button>→</button>
                  </div>
                </div>
              )}
          </div>
        </section>

        <NewsletterSection />
      </main>
    </CustomerLayout>
  );
}