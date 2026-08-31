"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  ShoppingCart,
} from "lucide-react";

import {
  Product,
  ProductImage,
} from "../types/catalogue.types";

type ProductCardProps = {
  product: Product;
  image?: ProductImage;
  originalPrice?: number | null;
  discountPercentage?: number | null;
  showWishlist?: boolean;
  showAddToCart?: boolean;
  badge?: string | null;
};

const productThemes = [
  "from-[#5b0b0f] via-[#b5151b] to-[#070707]",
  "from-[#332000] via-[#d4a821] to-[#070707]",
  "from-[#0d1828] via-[#30425f] to-[#070707]",
  "from-[#5b0b0f] via-[#c02626] to-[#070707]",
  "from-[#0b1e4a] via-[#1d4f9a] to-[#070707]",
  "from-[#06351f] via-[#117a44] to-[#070707]",
];

function resolveImageUrl(imageUrl?: string) {
  if (!imageUrl) {
    return null;
  }

  if (imageUrl.startsWith("http") || !imageUrl.startsWith("/uploads")) {
    return imageUrl;
  }

  try {
    const apiOrigin = new URL(
      process.env.NEXT_PUBLIC_API_URL ?? "",
    ).origin;

    return `${apiOrigin}${imageUrl}`;
  } catch {
    return imageUrl;
  }
}

function getProductTheme(productId: string) {
  const index =
    productId.split("").reduce((total, character) => {
      return total + character.charCodeAt(0);
    }, 0) % productThemes.length;

  return productThemes[index];
}

export function ProductCard({
  product,
  image,
  originalPrice = null,
  discountPercentage = null,
  showWishlist = true,
  showAddToCart = true,
  badge = null,
}: ProductCardProps) {
  const imageUrl = resolveImageUrl(image?.imageUrl);

  const formatPrice = (price: number) =>
    `${price.toLocaleString("en-US")} FCFA`;

  const formattedPrice = formatPrice(product.price);

  const formattedOriginalPrice =
    originalPrice !== null
      ? formatPrice(originalPrice)
      : null;

  return (
    <article className="group min-w-0 overflow-hidden rounded-[3px] border border-[#8B6A00] bg-[#101010]">
      <div className="relative">
        <Link href={`/shop/${product.id}`}>
          <div className="relative aspect-[1/0.86] overflow-hidden bg-[#151515] sm:aspect-[1/0.9] lg:aspect-[1/0.78]">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={image?.altText || product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              />
            ) : (
              <div
                className={`flex h-full items-center justify-center bg-gradient-to-br ${getProductTheme(
                  product.id,
                )}`}
              >
                <div className="relative h-[74%] w-[58%] rounded-t-[42%] border border-white/20 bg-white/10 shadow-[0_18px_30px_rgba(0,0,0,0.35)]">
                  <div className="absolute left-1/2 top-2 h-5 w-10 -translate-x-1/2 rounded-b-full border-b border-white/35" />

                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <p className="text-[9px] font-black uppercase leading-none text-white/90 sm:text-[10px]">
                      Maillot
                    </p>

                    <p className="mt-1 text-[28px] font-black leading-none text-white sm:text-[34px]">
                      {product.name.includes("23")
                        ? "23"
                        : product.name.includes("15")
                          ? "15"
                          : product.name.includes("30")
                            ? "30"
                            : "10"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {badge && (
              <span className="absolute left-2 top-2 rounded-[2px] bg-[#D4AF37] px-2 py-1 text-[8px] font-extrabold uppercase leading-none text-black">
                {badge}
              </span>
            )}

            {/* Discount */}
            {discountPercentage !== null &&
              discountPercentage > 0 && (
                <span className="absolute left-2 top-2 rounded-[2px] bg-[#E31B23] px-2 py-1 text-[8px] font-extrabold leading-none text-white">
                  -{discountPercentage}%
                </span>
              )}

            {showWishlist && (
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full border border-white/70 bg-black/40 text-white transition hover:border-[#D4AF37] hover:text-[#D4AF37]"
                aria-label={`Add ${product.name} to wishlist`}
              >
                <Heart
                  size={15}
                  strokeWidth={1.7}
                />
              </button>
            )}
          </div>
        </Link>
      </div>

      <div className="px-2 pb-2 pt-2 min-[380px]:px-2.5 sm:px-3 sm:pb-2.5 sm:pt-2.5">
        <Link href={`/shop/${product.id}`}>
          <h3 className="line-clamp-1 text-[10px] font-medium leading-4 text-white transition group-hover:text-[#D4AF37] sm:text-[11px]">
            {product.name}
          </h3>
        </Link>

        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <p className="text-[10px] font-extrabold text-white sm:text-[11px]">
            {formattedPrice}
          </p>

          {formattedOriginalPrice && (
            <p className="text-[8px] text-neutral-500 line-through sm:text-[9px]">
              {formattedOriginalPrice}
            </p>
          )}
        </div>

        {showAddToCart && (
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();

              // Cart functionality will be connected
              // when the cart module is implemented.
            }}
            className="mt-2 flex h-7 w-full items-center justify-center gap-1 rounded-[2px] border border-[#D4AF37] bg-transparent text-[7px] font-extrabold uppercase tracking-wide text-[#D4AF37] transition hover:bg-[#D4AF37] hover:text-black min-[380px]:gap-1.5 min-[380px]:text-[8px] sm:text-[9px]"
          >
            <ShoppingCart
              size={12}
              strokeWidth={2}
            />

            ADD TO CART
          </button>
        )}
      </div>
    </article>
  );
}
