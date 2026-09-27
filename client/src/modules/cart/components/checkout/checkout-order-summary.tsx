"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";

import { CartItem } from "../../types/cart.types";
import { ProductVariant } from "@/modules/catalogue/types/catalogue.types";
import { catalogueService } from "@/modules/catalogue/services/catalogue.service";

type Props = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  onVariantChange: (itemId: string, variant: ProductVariant) => void;
};

function resolveImageUrl(
  imageUrl: string | null,
) {
  if (!imageUrl) {
    return null;
  }

  if (
    imageUrl.startsWith("http") ||
    !imageUrl.startsWith("/uploads")
  ) {
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

function formatPrice(price: number) {
  return `${price.toLocaleString("en-US")} XAF`;
}

export function CheckoutOrderSummary({
  items,
  itemCount,
  subtotal,
  deliveryFee,
  total,
  onVariantChange,
}: Props) {
  return (
    <aside className="rounded-[8px] border border-neutral-200 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-extrabold uppercase">
          ORDER SUMMARY
        </h2>

        <Link
          href="/cart"
          className="text-[10px] font-semibold text-blue-600 hover:underline"
        >
          Edit Cart
        </Link>
      </div>

      <p className="mt-2 text-[10px] text-neutral-600">
        {itemCount}{" "}
        {itemCount === 1
          ? "Item"
          : "Items"}{" "}
        in Cart
      </p>

      <div className="mt-3">
        {items.map((item) => {
          const imageUrl = resolveImageUrl(
            item.imageUrl,
          );

          return (
            <div
              key={item.id}
              className="flex gap-3 border-b border-neutral-200 py-3 first:pt-0"
            >
              <div className="relative h-[70px] w-[70px] shrink-0 overflow-hidden rounded-[5px] border border-neutral-200 bg-neutral-50">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="70px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[8px] font-bold text-neutral-400">
                    PRODUCT
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold">
                  {item.product.name}
                </p>

                <div className="mt-1 text-[9px] text-neutral-600">
                  {item.variant?.size && (
                    <span>
                      Size: {item.variant.size}
                    </span>
                  )}

                  {item.variant?.color && (
                    <span>
                      {" "}
                      | Color:{" "}
                      {item.variant.color}
                    </span>
                  )}
                </div>

                <p className="mt-1 text-[9px] font-semibold">
                  Qty: {item.quantity}
                </p>

                {!item.variant?.id && (
                  <MissingCartVariant
                    item={item}
                    onVariantChange={onVariantChange}
                  />
                )}
              </div>

              <p className="shrink-0 text-[10px] font-bold">
                {formatPrice(
                  item.product.price *
                    item.quantity,
                )}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-3 space-y-2 border-b border-neutral-200 pb-3 text-[11px]">
        <div className="flex items-center justify-between">
          <span>Subtotal</span>
          <span className="font-semibold">
            {formatPrice(subtotal)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span>Delivery Fee</span>
          <span className="font-semibold">
            {formatPrice(deliveryFee)}
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[14px] font-extrabold uppercase">
          TOTAL
        </span>

        <span className="text-[19px] font-extrabold">
          {formatPrice(total)}
        </span>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-[6px] border border-green-200 bg-green-50 px-3 py-2.5">
        <ShieldCheck
          size={20}
          className="shrink-0 text-green-600"
        />

        <div>
          <p className="text-[10px] font-bold text-green-800">
            Secure Checkout
          </p>

          <p className="mt-0.5 text-[9px] text-green-700">
            Your information is safe and secure
          </p>
        </div>
      </div>
    </aside>
  );
}

function MissingCartVariant({
  item,
  onVariantChange,
}: {
  item: CartItem;
  onVariantChange: Props["onVariantChange"];
}) {
  const [variants, setVariants] = useState<ProductVariant[] | null>(null);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadVariants() {
      setError("");
      setVariants(null);

      try {
        const availableVariants = (
          await catalogueService.getProductVariants(item.product.id)
        ).filter(
          (variant) =>
            typeof variant.price === "number" &&
            Number.isFinite(variant.price) &&
            variant.price >= 0,
        );

        if (cancelled) {
          return;
        }

        setVariants(availableVariants);

        if (availableVariants.length === 1) {
          onVariantChange(item.id, availableVariants[0]);
        }
      } catch (error) {
        if (!cancelled) {
          setError(
            error instanceof Error ? error.message : "Unable to load variants.",
          );
        }
      }
    }

    void loadVariants();

    return () => {
      cancelled = true;
    };
  }, [item.id, item.product.id, onVariantChange, retryCount]);

  if (error) {
    return (
      <div className="mt-2 text-[10px] text-red-700" role="alert">
        <p>{error}</p>
        <button
          type="button"
          className="mt-1 font-semibold underline"
          onClick={() => setRetryCount((count) => count + 1)}
        >
          Retry
        </button>
      </div>
    );
  }

  if (variants === null) {
    return <p className="mt-2 text-[10px]">Loading variants...</p>;
  }

  if (variants.length === 0) {
    return (
      <p className="mt-2 text-[10px] text-red-700">
        No variants are available. Remove this item from your cart to continue.
      </p>
    );
  }

  return (
    <label className="mt-2 block text-[10px] font-semibold">
      Choose a variant
      <select
        aria-label={`Variant for ${item.product.name}`}
        value=""
        onChange={(event) => {
          const variant = variants.find((variant) => variant.id === event.target.value);

          if (variant) {
            try {
              onVariantChange(item.id, variant);
            } catch (error) {
              setError(
                error instanceof Error ? error.message : "Unable to update your cart.",
              );
            }
          }
        }}
        className="mt-1 w-full rounded-[4px] border border-neutral-300 p-1 font-normal"
      >
        <option value="" disabled>Select size / color</option>
        {variants.map((variant) => (
          <option key={variant.id} value={variant.id}>
            {[variant.size, variant.color, variant.edition, variant.sku]
              .filter(Boolean)
              .join(" / ")} - {formatPrice(variant.price!)}
          </option>
        ))}
      </select>
    </label>
  );
}
