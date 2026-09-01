"use client";

import Link from "next/link";
import { LockKeyhole } from "lucide-react";

type CartOrderSummaryProps = {
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
};

function formatPrice(value: number) {
  return `${value.toLocaleString()} XAF`;
}

export function CartOrderSummary({
  itemCount,
  subtotal,
  deliveryFee,
  total,
}: CartOrderSummaryProps) {
  return (
    <aside className="w-full lg:w-[360px] lg:shrink-0">
      <div className="rounded-[10px] border border-neutral-200 bg-white p-5 shadow-sm">
        <h2 className="text-[17px] font-extrabold uppercase">
          ORDER SUMMARY
        </h2>

        <div className="mt-5 space-y-4 text-[12px]">
          <div className="flex items-center justify-between">
            <span>
              Subtotal ({itemCount}{" "}
              {itemCount === 1
                ? "item"
                : "items"})
            </span>

            <span>
              {formatPrice(subtotal)}
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span>Delivery Fee</span>

              <span>
                {formatPrice(deliveryFee)}
              </span>
            </div>

            <p className="mt-1 text-[9px] text-neutral-500">
              Calculated at checkout
            </p>
          </div>
        </div>

        <div className="my-4 border-t border-neutral-200" />

        <div className="flex items-center justify-between">
          <span className="text-[15px] font-extrabold">
            TOTAL
          </span>

          <span className="text-[20px] font-extrabold">
            {formatPrice(total)}
          </span>
        </div>

        <Link
          href="/checkout"
          className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-[5px] bg-[#D4AF37] text-[11px] font-extrabold uppercase text-black transition hover:bg-[#c49f25]"
        >
          <LockKeyhole size={14} />
          PROCEED TO CHECKOUT
        </Link>
      </div>
    </aside>
  );
}