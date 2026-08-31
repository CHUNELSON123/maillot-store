"use client";

import Link from "next/link";
import {
  Shirt,
  Footprints,
  Dumbbell,
  ShoppingBag,
  Package,
  Tag,
  CircleDot,
  Heart,
} from "lucide-react";

type CategorySidebarItem = {
  name: string;
  count: number;
};

type CategorySidebarProps = {
  categories: CategorySidebarItem[];
};

const categoryIcons = [
  Shirt,
  Shirt,
  Footprints,
  Dumbbell,
  ShoppingBag,
  Package,
  CircleDot,
  ShoppingBag,
  Heart,
  Tag,
];

export function CategorySidebar({
  categories,
}: CategorySidebarProps) {
  return (
    <aside className="hidden w-[150px] shrink-0 md:block">
      <h1 className="text-[18px] font-extrabold uppercase tracking-tight text-neutral-950">
        CATEGORIES
      </h1>

      <p className="mt-2 text-[8px] leading-3 text-neutral-500">
        Shop by category and find your perfect gear.
      </p>

      <div className="mt-4 space-y-2">
        {categories.map((category, index) => {
          const Icon =
            categoryIcons[index] ?? Package;

          return (
            <Link
              key={category.name}
              href={`/shop?category=${encodeURIComponent(
                category.name,
              )}`}
              className="group flex items-center gap-2"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[3px] bg-neutral-100 text-neutral-700 transition group-hover:bg-[#D4AF37] group-hover:text-black">
                <Icon size={11} strokeWidth={1.8} />
              </span>

              <span className="min-w-0 flex-1 truncate text-[8px] font-semibold text-neutral-800 group-hover:text-[#A98200]">
                {category.name}
              </span>

              <span className="text-[7px] text-neutral-400">
                {category.count}
              </span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}