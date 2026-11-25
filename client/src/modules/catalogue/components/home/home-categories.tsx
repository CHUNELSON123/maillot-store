"use client";

import Link from "next/link";

import { Category } from "@/modules/catalogue/types/catalogue.types";

type HomeCategoriesProps = {
  categories: Category[];
};

const categoryThemes: Record<string, string> = {
  NFL: "from-[#101c2e] via-[#1b2430] to-[#070707]",
  NBA: "from-[#2e140b] via-[#25140b] to-[#070707]",
  Football: "from-[#102514] via-[#1f3216] to-[#070707]",
  NHL: "from-[#101010] via-[#222222] to-[#070707]",
  Accessories: "from-[#30120f] via-[#202020] to-[#070707]",
  Lifestyle: "from-[#1c2026] via-[#20242a] to-[#070707]",
};

function getCategoryTheme(name: string) {
  const normalizedName =
    name.charAt(0).toUpperCase() +
    name.slice(1).toLowerCase();

  return (
    categoryThemes[name] ||
    categoryThemes[normalizedName] ||
    "from-[#191919] via-[#242424] to-[#070707]"
  );
}

export function HomeCategories({
  categories,
}: HomeCategoriesProps) {
  const visibleCategories = categories;
  if (!visibleCategories.length) return null;

  return (
    <section className="bg-[#090909] px-3 py-4 text-white min-[380px]:px-4 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex items-center justify-center gap-3">
          <span className="h-px w-7 bg-[#D4AF37] min-[380px]:w-10 sm:w-16" />

          <h2 className="whitespace-nowrap text-[13px] font-extrabold uppercase tracking-wide sm:text-[17px]">
            SHOP BY CATEGORY
          </h2>

          <span className="h-px w-7 bg-[#D4AF37] min-[380px]:w-10 sm:w-16" />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
          {visibleCategories.map((category) => {
            const theme = getCategoryTheme(category.name);

            return (
              <Link
                key={category.id}
                href={`/shop?category=${encodeURIComponent(
                  category.name,
                )}`}
                className="group relative h-[86px] overflow-hidden rounded-[3px] border border-neutral-600 bg-[#111111] transition hover:border-[#D4AF37] min-[380px]:h-[92px] sm:h-[100px]"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${theme}`}
                />

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.22),transparent_23%)] opacity-80 transition duration-500 group-hover:scale-105" />

                <>{category.imageUrl && <img src={category.imageUrl.startsWith('/uploads/') ? (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/v1').replace(/\/v1\/?$/, '') + category.imageUrl : category.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />}</>

                <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/15 to-black/85" />

                <div className="absolute inset-x-0 bottom-2 text-center">
                  <h3 className="text-[10px] font-extrabold uppercase tracking-wide text-white sm:text-[11px]">
                    {category.name}
                  </h3>

                  <span className="mt-1 inline-block text-[9px] font-extrabold uppercase tracking-wide text-[#D4AF37]">
                    SHOP NOW
                    <span className="ml-1 text-[11px]">-&gt;</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
