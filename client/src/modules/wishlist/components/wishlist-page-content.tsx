
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";

import { CustomerLayout } from "@/modules/customer/components/customer-layout";
import { useWishlist } from "@/modules/wishlist/hooks/use-wishlist";
import { useCart } from "@/modules/cart/hooks/use-cart";
import { catalogueService } from "@/modules/catalogue/services/catalogue.service";
import type { ProductVariant } from "@/modules/catalogue/types/catalogue.types";

function resolveImageUrl(imageUrl?: string | null): string | null {
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

export function WishlistPageContent() {
  const { items, removeItem, isReady } = useWishlist();
  const { addItem } = useCart();

  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, string>>({});

  const handleAddToCart = async (productId: string) => {
    const wishlistItem = items.find(
      (item) => item.product.id === productId,
    );

    if (!wishlistItem || addingProductId) {
      return;
    }

    setAddingProductId(productId);
    setMessages((current) => ({ ...current, [productId]: "" }));

    try {
      const variants = await catalogueService.getProductVariants(productId);

      const purchasableVariants = variants.filter(
        (variant): variant is ProductVariant & { price: number } =>
          typeof variant.price === "number" &&
          Number.isFinite(variant.price) &&
          variant.price >= 0,
      );

      if (purchasableVariants.length === 0) {
        setMessages((current) => ({
          ...current,
          [productId]: "This product is currently unavailable.",
        }));
        return;
      }

      if (purchasableVariants.length > 1) {
        window.location.href = `/shop/${productId}`;
        return;
      }

      const variant = purchasableVariants[0];

      const imageUrl = resolveImageUrl(
        wishlistItem.image?.imageUrl,
      );

      addItem({
        product: {
          ...wishlistItem.product,
          price: variant.price,
        },
        variant,
        imageUrl,
        quantity: 1,
      });

      setMessages((current) => ({
        ...current,
        [productId]: "Added to cart successfully.",
      }));
    } catch (error) {
      setMessages((current) => ({
        ...current,
        [productId]:
          error instanceof Error
            ? error.message
            : "Unable to add this product. Please try again.",
      }));
    } finally {
      setAddingProductId(null);
    }
  };

  return (
    <CustomerLayout>
      <main className="min-h-[60vh] bg-white text-black">
        <section className="border-b border-neutral-200 bg-neutral-50">
          <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-8 sm:py-14">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#8B6A00]">
              Your collection
            </p>

            <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tight sm:text-4xl">
                  My Wishlist
                </h1>

                <p className="mt-2 text-sm text-neutral-600">
                  Keep track of the jerseys and merchandise you love.
                </p>
              </div>

              {isReady && (
                <span className="text-sm font-semibold text-neutral-600">
                  {items.length} {items.length === 1 ? "item" : "items"}
                </span>
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1200px] px-4 py-8 sm:px-8 sm:py-12">
          {!isReady ? (
            <div
              className="py-16 text-center text-sm text-neutral-500"
              role="status"
            >
              Loading your wishlist...
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center sm:py-24">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
                <Heart
                  size={30}
                  strokeWidth={1.5}
                  className="text-neutral-500"
                />
              </div>

              <h2 className="mt-6 text-xl font-bold">
                Your wishlist is empty
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-neutral-600">
                You haven&apos;t saved any products yet. Browse our collection
                and add your favourite items here.
              </p>

              <Link
                href="/shop"
                className="mt-7 inline-flex min-h-11 items-center justify-center bg-black px-7 text-xs font-extrabold uppercase tracking-wider text-[#D4AF37] transition hover:bg-neutral-800"
              >
                Explore the shop
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
                {items.map((item) => {
                  const imageUrl = resolveImageUrl(
                    item.image?.imageUrl,
                  );

                  const isAdding = addingProductId === item.product.id;
                  const message = messages[item.product.id];

                  return (
                    <article
                      key={item.product.id}
                      className="flex min-w-0 flex-col overflow-hidden border border-neutral-200 bg-white"
                    >
                      <Link
                        href={`/shop/${item.product.id}`}
                        className="group relative block aspect-[4/5] overflow-hidden bg-neutral-100"
                      >
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={item.image?.altText || item.product.name}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-neutral-100 px-3 text-center">
                            <span className="text-sm font-bold text-neutral-400">
                              {item.product.name}
                            </span>
                          </div>
                        )}

                        <span className="absolute left-2 top-2 bg-white px-2 py-1 text-[9px] font-bold uppercase tracking-wide">
                          Saved
                        </span>
                      </Link>

                      <div className="flex flex-1 flex-col p-3 sm:p-4">
                        <Link
                          href={`/shop/${item.product.id}`}
                          className="line-clamp-2 text-sm font-semibold transition hover:text-[#8B6A00]"
                        >
                          {item.product.name}
                        </Link>

                        <p className="mt-2 text-sm font-extrabold">
                          {item.product.price.toLocaleString("en-US")} FCFA
                        </p>

                        <div className="mt-auto space-y-2 pt-4">
                          <button
                            type="button"
                            onClick={() => handleAddToCart(item.product.id)}
                            disabled={addingProductId !== null}
                            className="flex min-h-10 w-full items-center justify-center gap-2 bg-black px-2 text-[10px] font-extrabold uppercase tracking-wide text-[#D4AF37] transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 sm:text-xs"
                          >
                            <ShoppingCart size={15} />
                            {isAdding ? "Adding..." : "Add to cart"}
                          </button>

                          <button
                            type="button"
                            onClick={() => removeItem(item.product.id)}
                            className="flex min-h-9 w-full items-center justify-center gap-2 border border-neutral-200 px-2 text-[10px] font-bold uppercase tracking-wide text-neutral-600 transition hover:border-red-300 hover:text-red-600 sm:text-xs"
                          >
                            <Trash2 size={14} />
                            Remove
                          </button>

                          {message && (
                            <p
                              role="status"
                              className={`text-xs leading-5 ${
                                message.includes("successfully")
                                  ? "text-green-700"
                                  : "text-red-600"
                              }`}
                            >
                              {message}
                            </p>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="mt-8 border-t border-neutral-200 pt-6">
                <Link
                  href="/shop"
                  className="text-sm font-bold text-neutral-700 underline underline-offset-4 transition hover:text-[#8B6A00]"
                >
                  Continue shopping
                </Link>
              </div>
            </>
          )}
        </section>
      </main>
    </CustomerLayout>
  );
}
