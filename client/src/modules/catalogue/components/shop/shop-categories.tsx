"use client";

import type { Category } from "@/modules/catalogue/types/catalogue.types";

type ShopCategoriesProps = {
  categories: Category[];
  selectedCategoryId: string;
  onCategoryChange: (categoryId: string) => void;
};

export function ShopCategories({
  categories,
  selectedCategoryId,
  onCategoryChange,
}: ShopCategoriesProps) {
  return (
    <section className="py-5">
      <h2 className="text-xl font-bold">
        SHOP BY CATEGORY
      </h2>

      <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
        {[{ id: "all", name: "All" }, ...categories].map((category) => {
          const active = selectedCategoryId === category.id;

          return (
            <button
              key={category.id}
              type="button"
              onClick={() =>
                onCategoryChange(category.id)
              }
              className={`shrink-0 rounded-full border px-6 py-2 text-sm font-medium transition ${
                active
                  ? "border-black bg-black text-white"
                  : "border-neutral-300 bg-white text-neutral-900 hover:border-black"
              }`}
            >
              {category.name}
            </button>
          );
        })}
      </div>
    </section>
  );
}
