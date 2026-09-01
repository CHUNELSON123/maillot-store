"use client";

import { MapPin } from "lucide-react";

import type { DeliveryMethod } from "./checkout-page-content";

type Props = {
  deliveryMethod: DeliveryMethod;
  onDeliveryMethodChange: (
    method: DeliveryMethod,
  ) => void;
};

export function CheckoutDeliveryForm({
  deliveryMethod,
  onDeliveryMethodChange,
}: Props) {
  return (
    <section className="mt-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D4A017] text-white">
          <MapPin size={17} />
        </span>

        <h2 className="text-[15px] font-extrabold uppercase">
          2. DELIVERY INFORMATION
        </h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Address */}
        <div>
          <label className="block">
            <span className="mb-1 block text-[10px] font-semibold">
              Delivery Address{" "}
              <span className="text-red-500">*</span>
            </span>

            <input
              type="text"
              placeholder="Quarter Mile 2, Opposite Buea Mountain Hotel"
              className="h-8 w-full rounded-[4px] border border-neutral-300 px-3 text-[11px] outline-none transition focus:border-[#D4AF37]"
            />
          </label>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-[10px] font-semibold">
                City / Town{" "}
                <span className="text-red-500">*</span>
              </span>

              <input
                type="text"
                placeholder="Buea"
                className="h-8 w-full rounded-[4px] border border-neutral-300 px-3 text-[11px] outline-none transition focus:border-[#D4AF37]"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-[10px] font-semibold">
                Postal Code{" "}
                <span className="font-normal text-neutral-500">
                  (Optional)
                </span>
              </span>

              <input
                type="text"
                placeholder="00237"
                className="h-8 w-full rounded-[4px] border border-neutral-300 px-3 text-[11px] outline-none transition focus:border-[#D4AF37]"
              />
            </label>
          </div>
        </div>

        {/* Delivery options */}
        <div className="rounded-[6px] border border-neutral-300 p-3">
          <h3 className="text-[11px] font-bold">
            Delivery Option{" "}
            <span className="text-red-500">*</span>
          </h3>

          <button
            type="button"
            onClick={() =>
              onDeliveryMethodChange("delivery")
            }
            className="mt-3 flex w-full items-start gap-2 text-left"
          >
            <span
              className={`mt-0.5 flex h-4 w-4 items-center justify-center rounded-full border ${
                deliveryMethod === "delivery"
                  ? "border-[#D4A017]"
                  : "border-neutral-400"
              }`}
            >
              {deliveryMethod === "delivery" && (
                <span className="h-2 w-2 rounded-full bg-[#D4A017]" />
              )}
            </span>

            <span className="min-w-0 flex-1">
              <span className="flex justify-between gap-3 text-[11px] font-bold">
                <span>Home Delivery</span>
                <span>2,000 XAF</span>
              </span>

              <span className="mt-0.5 block text-[9px] text-neutral-500">
                Delivery to your provided address
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              onDeliveryMethodChange("pickup")
            }
            className="mt-4 flex w-full items-start gap-2 text-left"
          >
            <span
              className={`mt-0.5 flex h-4 w-4 items-center justify-center rounded-full border ${
                deliveryMethod === "pickup"
                  ? "border-[#D4A017]"
                  : "border-neutral-400"
              }`}
            >
              {deliveryMethod === "pickup" && (
                <span className="h-2 w-2 rounded-full bg-[#D4A017]" />
              )}
            </span>

            <span className="min-w-0 flex-1">
              <span className="flex justify-between gap-3 text-[11px] font-bold">
                <span>Pickup at Store</span>
                <span>Free</span>
              </span>

              <span className="mt-0.5 block text-[9px] text-neutral-500">
                Pick up your order at our shop
              </span>
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}