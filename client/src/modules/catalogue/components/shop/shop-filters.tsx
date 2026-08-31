"use client";

import { RotateCcw, Search } from "lucide-react";

type ShopFiltersProps = {
  search: string;
  sort: string;
  onSearchChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onClear: () => void;
};

export function ShopFilters({
  search,
  sort,
  onSearchChange,
  onSortChange,
  onClear,
}: ShopFiltersProps) {
  return (
    <div className="border-b border-neutral-200">
      <div className="flex flex-col gap-4 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <form
          onSubmit={(event) =>
            event.preventDefault()
          }
          className="flex w-full max-w-xl"
        >
          <div className="relative flex-1">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700"
            />

            <input
              value={search}
              onChange={(event) =>
                onSearchChange(event.target.value)
              }
              placeholder="Search products..."
              className="h-11 w-full border border-neutral-300 bg-white pl-12 pr-4 text-sm outline-none focus:border-[#D4AF37]"
            />
          </div>

          <button
            type="submit"
            className="h-11 bg-black px-8 text-sm font-semibold text-white"
          >
            SEARCH
          </button>
        </form>

        <div className="flex items-center gap-3">
          <label
            htmlFor="shop-sort"
            className="text-sm"
          >
            Sort by:
          </label>

          <select
            id="shop-sort"
            value={sort}
            onChange={(event) =>
              onSortChange(event.target.value)
            }
            className="h-11 min-w-40 border border-neutral-300 bg-white px-4 text-sm outline-none"
          >
            <option>Featured</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-neutral-200 py-4">
        <span className="mr-1 text-sm font-medium">
          Filter:
        </span>

        <select className="h-10 border border-neutral-300 bg-white px-4 text-sm">
          <option>Category</option>
        </select>

        <select className="h-10 border border-neutral-300 bg-white px-4 text-sm">
          <option>Price</option>
        </select>

        <select className="h-10 border border-neutral-300 bg-white px-4 text-sm">
          <option>Size</option>
        </select>

        <button
          type="button"
          onClick={onClear}
          className="flex h-10 items-center gap-2 border border-neutral-300 px-4 text-sm font-medium hover:bg-neutral-50"
        >
          <RotateCcw size={16} />
          CLEAR ALL
        </button>
      </div>
    </div>
  );
}