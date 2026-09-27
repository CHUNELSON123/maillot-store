"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, Home, Mail, MapPin, Phone } from "lucide-react";

import { CustomerLayout } from "@/modules/customer/components/customer-layout";
import { NewsletterSection } from "@/components/shared/newsletter-section";
import { orderConfirmationStorage } from "../../services/order-confirmation-storage";
import type { OrderConfirmationData } from "../../services/order-confirmation-storage";

import { OrderConfirmationSummary } from "./order-confirmation-summary";
import { OrderConfirmationTimeline } from "./order-confirmation-timeline";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function getPaymentLabel(paymentMethod: string) {
  switch (paymentMethod) {
    case "mtn":
      return "MTN Mobile Money";
    case "orange":
      return "Orange Money";
    case "card":
      return "Card";
    case "cash":
      return "Cash Before Delivery";
    default:
      return paymentMethod;
  }
}

export function OrderConfirmationPageContent() {
  const [confirmation, setConfirmation] = useState<
    OrderConfirmationData | null | undefined
  >(undefined);

  useEffect(() => {
    setConfirmation(orderConfirmationStorage.get());
  }, []);

  if (confirmation === undefined) {
    return null;
  }

  if (!confirmation) {
    return (
      <CustomerLayout>
        <main className="min-h-screen bg-white text-neutral-950">
          <section className="mx-auto flex min-h-[60vh] max-w-4xl items-center justify-center px-4 py-16">
            <div className="w-full max-w-xl text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
                <CheckCircle2 className="h-8 w-8 text-neutral-400" />
              </div>

              <h1 className="text-2xl font-semibold">
                No Order Found
              </h1>

              <p className="mt-3 text-sm leading-6 text-neutral-500">
                We could not find recent order information on this device.
                Please return to the shop and place an order.
              </p>

              <Link
                href="/shop"
                className="mt-8 inline-flex items-center justify-center rounded-md bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                Continue Shopping
              </Link>
            </div>
          </section>

          <NewsletterSection />
        </main>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <main className="min-h-screen bg-white text-neutral-950">
        {/* Breadcrumb */}
        <section className="border-b border-neutral-200">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <Link
                href="/"
                className="inline-flex items-center gap-1 transition hover:text-[#D4AF37]"
              >
                <Home className="h-4 w-4" />
                Home
              </Link>

              <span>/</span>

              <span className="text-neutral-900">
                Order Confirmed
              </span>
            </div>
          </div>
        </section>

        {/* Confirmation Header */}
        <section className="border-b border-neutral-200 bg-neutral-50">
          <div className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6 lg:px-8">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#D4AF37]/15">
              <CheckCircle2 className="h-9 w-9 text-[#D4AF37]" />
            </div>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Thank You for Your Order!
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-neutral-600 sm:text-base">
              Your order has been received successfully. We will process it
              and keep you updated about its progress.
            </p>

            <div className="mt-6">
              <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                Order Number
              </p>

              <p className="mt-2 text-xl font-semibold">
                {confirmation.orderNumber}
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="space-y-8">
              {/* Order Details */}
              <section className="rounded-lg border border-neutral-200 bg-white p-5 sm:p-6">
                <h2 className="text-lg font-semibold">
                  Order Details
                </h2>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-neutral-500">
                      Order Number
                    </p>
                    <p className="mt-1 text-sm font-medium">
                      {confirmation.orderNumber}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-neutral-500">
                      Order Date
                    </p>
                    <p className="mt-1 text-sm font-medium">
                      {formatDate(confirmation.orderDate)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-neutral-500">
                      Payment Method
                    </p>
                    <p className="mt-1 text-sm font-medium">
                      {getPaymentLabel(confirmation.paymentMethod)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-neutral-500">
                      Order Status
                    </p>
                    <p className="mt-1 inline-flex rounded-full bg-[#D4AF37]/15 px-3 py-1 text-xs font-semibold text-neutral-900">
                      Pending
                    </p>
                  </div>
                </div>
              </section>

              {/* Delivery Information */}
              <section className="rounded-lg border border-neutral-200 bg-white p-5 sm:p-6">
                <h2 className="text-lg font-semibold">
                  {confirmation.delivery.method === "delivery"
                    ? "Delivery Information"
                    : "Pickup Information"}
                </h2>

                <div className="mt-5 space-y-4">
                  <div className="flex gap-3">
                    <div className="mt-0.5 shrink-0">
                      <MapPin className="h-5 w-5 text-[#D4AF37]" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold">
                        {confirmation.customer.fullName}
                      </p>

                      {confirmation.delivery.method === "delivery" ? (
                        <p className="mt-1 text-sm leading-6 text-neutral-500">
                          {confirmation.delivery.address}
                          <br />
                          {confirmation.delivery.city}
                          {confirmation.delivery.postalCode
                            ? `, ${confirmation.delivery.postalCode}`
                            : ""}
                        </p>
                      ) : (
                        <p className="mt-1 text-sm text-neutral-500">
                          Store Pickup
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Phone className="mt-0.5 h-5 w-5 shrink-0 text-[#D4AF37]" />

                    <div>
                      <p className="text-xs uppercase tracking-wide text-neutral-500">
                        Phone
                      </p>
                      <p className="mt-1 text-sm">
                        {confirmation.customer.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Mail className="mt-0.5 h-5 w-5 shrink-0 text-[#D4AF37]" />

                    <div>
                      <p className="text-xs uppercase tracking-wide text-neutral-500">
                        Email
                      </p>
                      <p className="mt-1 break-all text-sm">
                        {confirmation.customer.email}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Order Timeline */}
              <section className="rounded-lg border border-neutral-200 bg-white p-5 sm:p-6">
                <h2 className="text-lg font-semibold">
                  Order Status
                </h2>

                <div className="mt-6">
                  <OrderConfirmationTimeline />
                </div>
              </section>

              {/* Actions */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/shop"
                  className="inline-flex flex-1 items-center justify-center rounded-md bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
                >
                  Continue Shopping
                </Link>

                <Link
                  href="/account/orders"
                  className="inline-flex flex-1 items-center justify-center rounded-md border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-900 transition hover:border-[#D4AF37] hover:text-[#D4AF37]"
                >
                  View My Orders
                </Link>
              </div>
            </div>

            {/* Summary */}
            <div>
              <OrderConfirmationSummary
                items={confirmation.items}
                subtotal={confirmation.subtotal}
                deliveryFee={confirmation.deliveryFee}
                total={confirmation.total}
              />
            </div>
          </div>
        </section>

        <NewsletterSection />
      </main>
    </CustomerLayout>
  );
}
