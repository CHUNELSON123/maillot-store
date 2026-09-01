"use client";

import { useState } from "react";
import Link from "next/link";
import { Home, Lock } from "lucide-react";

import { CustomerLayout } from "@/modules/customer/components/customer-layout";
import { NewsletterSection } from "@/components/shared/newsletter-section";
import { authStorage } from "@/lib/auth/auth-storage";
import { useCart } from "../../hooks/use-cart";

import { CheckoutAccountPrompt } from "@/modules/checkout/components/checkout-account-prompt";
import { CheckoutContactForm } from "./checkout-contact-form";
import { CheckoutDeliveryForm } from "./checkout-delivery-form";
import { CheckoutPaymentMethods } from "./checkout-payment-methods";
import { CheckoutOrderSummary } from "./checkout-order-summary";

export type DeliveryMethod =
  | "delivery"
  | "pickup";

export type PaymentMethod =
  | "mtn"
  | "orange"
  | "card"
  | "cash";

export function CheckoutPageContent() {
  const {
    items,
    itemCount,
    subtotal,
    deliveryFee,
    total,
  } = useCart();

  const [deliveryMethod, setDeliveryMethod] =
    useState<DeliveryMethod>("delivery");

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("mtn");

  const [termsAccepted, setTermsAccepted] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [showAccountPrompt, setShowAccountPrompt] =
    useState(false);

  const actualDeliveryFee =
    deliveryMethod === "delivery"
      ? deliveryFee
      : 0;

  const actualTotal =
    subtotal + actualDeliveryFee;

  const submitOrder = async () => {
    if (!termsAccepted || items.length === 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Order submission will be connected
      // to the backend when the order module
      // is implemented.
      console.log("Place order", {
        deliveryMethod,
        paymentMethod,
        total: actualTotal,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlaceOrder = () => {
    if (!termsAccepted || items.length === 0) {
      return;
    }

    const token = authStorage.getToken();

    if (!token) {
      setShowAccountPrompt(true);
      return;
    }

    void submitOrder();
  };

  const handleContinueAsGuest = () => {
    setShowAccountPrompt(false);
    void submitOrder();
  };

  return (
    <CustomerLayout>
      <main className="min-h-screen bg-white text-neutral-950">
        <section className="mx-auto max-w-[1200px] px-5 pb-0 pt-4 sm:px-8 lg:px-5">
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

            <Link
              href="/cart"
              className="transition hover:text-[#D4AF37]"
            >
              Cart
            </Link>

            <span className="text-neutral-400">
              ›
            </span>

            <span className="font-semibold">
              Checkout
            </span>
          </div>

          {/* Heading */}
          <div className="mt-4">
            <h1 className="text-[25px] font-extrabold uppercase tracking-tight sm:text-[28px]">
              CHECKOUT
            </h1>

            <p className="mt-0.5 text-[11px] text-neutral-600 sm:text-[12px]">
              Please fill in the information below to complete your order.
            </p>
          </div>

          {items.length === 0 ? (
            <div className="flex min-h-[350px] flex-col items-center justify-center text-center">
              <h2 className="text-[18px] font-extrabold uppercase">
                YOUR CART IS EMPTY
              </h2>

              <p className="mt-2 text-[11px] text-neutral-500">
                Add products to your cart before checking out.
              </p>

              <Link
                href="/shop"
                className="mt-5 inline-flex h-10 items-center justify-center bg-[#D4AF37] px-8 text-[10px] font-extrabold uppercase text-black transition hover:bg-[#c49f25]"
              >
                CONTINUE SHOPPING
              </Link>
            </div>
          ) : (
            <div className="mt-3 grid gap-6 lg:grid-cols-[1fr_390px]">
              {/* Left side */}
              <div className="min-w-0 rounded-[8px] border border-neutral-200 px-4 py-3 sm:px-5">
                <CheckoutContactForm />

                <CheckoutDeliveryForm
                  deliveryMethod={deliveryMethod}
                  onDeliveryMethodChange={
                    setDeliveryMethod
                  }
                />

                <CheckoutPaymentMethods
                  paymentMethod={paymentMethod}
                  onPaymentMethodChange={
                    setPaymentMethod
                  }
                  termsAccepted={termsAccepted}
                  onTermsChange={setTermsAccepted}
                />

                <button
                  type="button"
                  disabled={
                    !termsAccepted ||
                    isSubmitting
                  }
                  onClick={handlePlaceOrder}
                  className="mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-[4px] bg-[#D4AF37] text-[10px] font-extrabold uppercase text-black transition hover:bg-[#c49f25] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Lock size={13} />

                  {isSubmitting
                    ? "PROCESSING..."
                    : "PLACE ORDER"}
                </button>

                <div className="mt-3 flex items-center justify-center gap-1.5 text-[9px] text-neutral-600">
                  <Lock size={11} />
                  Your payment is secure and encrypted
                </div>
              </div>

              {/* Right side */}
              <div className="lg:sticky lg:top-4 lg:self-start">
                <CheckoutOrderSummary
                  items={items}
                  itemCount={itemCount}
                  subtotal={subtotal}
                  deliveryFee={actualDeliveryFee}
                  total={actualTotal}
                />
              </div>
            </div>
          )}
        </section>

        <NewsletterSection />

        {showAccountPrompt && (
          <CheckoutAccountPrompt
            onContinueAsGuest={
              handleContinueAsGuest
            }
            onClose={() =>
              setShowAccountPrompt(false)
            }
          />
        )}
      </main>
    </CustomerLayout>
  );
}