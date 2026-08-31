"use client";

import Image from "next/image";
import Link from "next/link";

type CategoryCardProps = {
  name: string;
  count: number;
  imageUrl?: string;
};

export function CategoryCard({
  name,
  count,
  imageUrl,
}: CategoryCardProps) {
  return (
    <Link
      href={`/shop?category=${encodeURIComponent(name)}`}
      className="group block"
    >
      <div className="relative h-[118px] overflow-hidden rounded-[5px] bg-neutral-100 sm:h-[135px]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, 33vw"
            className="object-contain p-3 transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[10px] font-semibold uppercase text-neutral-400">
            No Image
          </div>
        )}
      </div>

      <div className="pt-2 text-center">
        <h3 className="text-[9px] font-extrabold uppercase text-neutral-950 sm:text-[10px]">
          {name}
        </h3>

        <p className="mt-0.5 text-[7px] text-neutral-500 sm:text-[8px]">
          {count} items
        </p>
      </div>
    </Link>
  );
}