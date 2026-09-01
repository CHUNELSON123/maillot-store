"use client";

import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

import { CustomerLayout } from "@/modules/customer/components/customer-layout";
import { NewsletterSection } from "@/components/shared/newsletter-section";

import { useCart } from "../hooks/use-cart";
import { CartItem } from "./cart-item";
import { CartOrderSummary } from "./cart-order-summary";
import { CartSupport } from "./cart-support";

export function CartPageContent() {
  const {
    items,
    itemCount,
    subtotal,
    deliveryFee,
    total,
    isReady,
    updateQuantity,
    removeItem,
  } = useCart();

  if (!isReady) {
    return (
      <CustomerLayout>
        <main className="bg-white text-neutral-950">
          <section className="mx-auto max-w-[1200px] px-5 pt-5 pb-6 sm:px-8 lg:px-5">
            <div className="flex min-h-[360px] items-center justify-center">
              <div className="text-center text-[11px] text-neutral-500">
                Loading cart...
              </div>
            </div>
          </section>

          <NewsletterSection />
        </main>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <main className="bg-white text-neutral-950">
        <section className="mx-auto max-w-[1200px] px-5 pt-5 pb-6 sm:px-8 lg:px-5">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[9px]">
            <Link
              href="/"
              className="flex items-center gap-1.5 transition hover:text-[#D4AF37]"
            >
              <Home size={11} />
              Home
            </Link>

            <span className="text-neutral-400">
              ›
            </span>

            <span className="font-semibold">
              Cart
            </span>
          </div>

          {/* Heading */}
          <div className="mt-5">
            <h1 className="text-[28px] font-extrabold uppercase tracking-tight sm:text-[32px]">
              YOUR CART
            </h1>

            <p className="mt-1 text-[13px] text-neutral-600">
              {itemCount}{" "}
              {itemCount === 1 ? "item" : "items"}{" "}
              in your cart
            </p>
          </div>

          {items.length === 0 ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center border border-neutral-200 px-5 text-center">
              <h2 className="text-[18px] font-bold uppercase">
                YOUR CART IS EMPTY
              </h2>

              <p className="mt-2 text-[11px] text-neutral-500">
                Add some jerseys or merchandise
                to your cart to continue.
              </p>

              <Link
                href="/shop"
                className="mt-6 inline-flex h-10 items-center justify-center bg-[#D4AF37] px-8 text-[10px] font-extrabold uppercase text-black transition hover:bg-[#c49f25]"
              >
                CONTINUE SHOPPING
              </Link>
            </div>
          ) : (
            <>
              <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-start">
                {/* Cart items */}
                <div className="min-w-0 flex-1 rounded-[10px] border border-neutral-200 bg-white px-5 shadow-sm">
                  {/* Table headings */}
                  <div className="hidden grid-cols-[1fr_130px_110px_120px] gap-4 border-b border-neutral-200 py-4 text-[10px] font-extrabold uppercase sm:grid">
                    <span>PRODUCT</span>
                    <span>PRICE</span>
                    <span>QUANTITY</span>
                    <span>TOTAL</span>
                  </div>

                  {items.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onQuantityChange={(quantity) =>
                        updateQuantity(item.id, quantity)
                      }
                      onRemove={() =>
                        removeItem(item.id)
                      }
                    />
                  ))}
                </div>

                {/* Summary */}
                <div className="lg:w-[360px]">
                  <CartOrderSummary
                    itemCount={itemCount}
                    subtotal={subtotal}
                    deliveryFee={deliveryFee}
                    total={total}
                  />

                  <CartSupport />
                </div>
              </div>

              {/* Continue shopping */}
              <Link
                href="/shop"
                className="mt-7 inline-flex h-10 items-center gap-2 border border-neutral-700 px-5 text-[10px] font-semibold uppercase transition hover:bg-neutral-50"
              >
                <ArrowLeft size={14} />
                CONTINUE SHOPPING
              </Link>
            </>
          )}
        </section>

        <NewsletterSection />
      </main>
    </CustomerLayout>
  );
}