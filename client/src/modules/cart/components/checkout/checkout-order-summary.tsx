"use client";

import Image from "next/image";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { CartItem } from "../../types/cart.types";

type Props = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
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