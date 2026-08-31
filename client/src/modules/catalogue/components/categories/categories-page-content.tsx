"use client";

import Link from "next/link";
import { useMemo } from "react";

import { useCategories } from "@/modules/catalogue/hooks/use-categories";
import { useCatalogue } from "@/modules/catalogue/hooks/use-catalogue";
import { NewsletterSection } from "@/components/shared/newsletter-section";

import { CategoryCard } from "./category-card";
import { CategorySidebar } from "./category-sidebar";

export function CategoriesPageContent() {
  const {
    categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useCategories();

  const {
    products,
    images,
    isLoading: productsLoading,
  } = useCatalogue();

  const categoryCounts = useMemo(() => {
    return categories.map((category) => ({
      ...category,
      count: products.filter(
        (product) =>
          product.categoryId === category.id,
      ).length,
    }));
  }, [categories, products]);

  const categoryImages = useMemo(() => {
    const imageMap = new Map<string, string>();

    products.forEach((product) => {
      const primaryImage = images.find(
        (image) =>
          image.productId === product.id &&
          image.isPrimary,
      );

      const firstImage = images.find(
        (image) =>
          image.productId === product.id,
      );

      const imageUrl =
        primaryImage?.imageUrl ??
        firstImage?.imageUrl;

      if (
        imageUrl &&
        !imageMap.has(product.categoryId)
      ) {
        imageMap.set(
          product.categoryId,
          imageUrl,
        );
      }
    });

    return imageMap;
  }, [products, images]);

  const sidebarCategories = categoryCounts.map(
    (category) => ({
      name: category.name,
      count: category.count,
    }),
  );

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
            Categories
          </span>
        </div>

        {categoriesLoading || productsLoading ? (
          <div className="flex min-h-[360px] items-center justify-center">
            <p className="text-[10px] text-neutral-500">
              Loading categories...
            </p>
          </div>
        ) : categoriesError ? (
          <div className="border border-red-200 bg-red-50 px-4 py-3 text-[10px] text-red-600">
            {categoriesError}
          </div>
        ) : (
          <div className="flex items-start gap-6">
            {/* Sidebar */}
            <CategorySidebar
              categories={sidebarCategories}
            />

            {/* Main content */}
            <div className="min-w-0 flex-1">
              {/* Mobile heading */}
              <div className="mb-4 md:hidden">
                <h1 className="text-[18px] font-extrabold uppercase tracking-tight">
                  CATEGORIES
                </h1>

                <p className="mt-1 text-[8px] text-neutral-500">
                  Shop by category and find your perfect gear.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                {categoryCounts.map((category) => (
                  <CategoryCard
                    key={category.id}
                    name={category.name}
                    count={category.count}
                    imageUrl={categoryImages.get(
                      category.id,
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      <NewsletterSection />
    </main>
  );
}