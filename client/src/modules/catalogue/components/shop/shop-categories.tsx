"use client";

type ShopCategoriesProps = {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
};

const categories = [
  "All",
  "Football",
  "Basketball",
  "NFL",
  "Training",
  "Accessories",
  "Retro",
  "Kids",
];

export function ShopCategories({
  selectedCategory,
  onCategoryChange,
}: ShopCategoriesProps) {
  return (
    <section className="py-5">
      <h2 className="text-xl font-bold">
        SHOP BY CATEGORY
      </h2>

      <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
        {categories.map((category) => {
          const active =
            selectedCategory === category;

          return (
            <button
              key={category}
              type="button"
              onClick={() =>
                onCategoryChange(category)
              }
              className={`shrink-0 rounded-full border px-6 py-2 text-sm font-medium transition ${
                active
                  ? "border-black bg-black text-white"
                  : "border-neutral-300 bg-white text-neutral-900 hover:border-black"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>
    </section>
  );
}