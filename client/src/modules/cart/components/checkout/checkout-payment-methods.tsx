"use client";

import { CreditCard } from "lucide-react";

import type { PaymentMethod } from "./checkout-page-content";

type Props = {
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (
    method: PaymentMethod,
  ) => void;
  termsAccepted: boolean;
  onTermsChange: (accepted: boolean) => void;
};

const paymentMethods: {
  id: PaymentMethod;
  title: string;
  details: string;
}[] = [
  {
    id: "mtn",
    title: "MTN Mobile Money",
    details: "MTN MoMo",
  },
  {
    id: "orange",
    title: "Orange Money",
    details: "Orange Money",
  },
  {
    id: "card",
    title: "Bank Card",
    details: "VISA • Mastercard",
  },
  {
    id: "cash",
    title: "Cash Before Delivery",
    details: "Cash",
  },
];

export function CheckoutPaymentMethods({
  paymentMethod,
  onPaymentMethodChange,
  termsAccepted,
  onTermsChange,
}: Props) {
  return (
    <section className="mt-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D4A017] text-white">
          <CreditCard size={17} />
        </span>

        <h2 className="text-[15px] font-extrabold uppercase">
          3. PAYMENT METHOD
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {paymentMethods.map((method) => {
          const selected =
            paymentMethod === method.id;

          return (
            <button
              key={method.id}
              type="button"
              onClick={() =>
                onPaymentMethodChange(method.id)
              }
              className={`min-h-[72px] rounded-[6px] border px-3 py-2 text-left transition ${
                selected
                  ? "border-[#D4A017]"
                  : "border-neutral-300 hover:border-neutral-400"
              }`}
            >
              <div className="flex items-start gap-2">
                <span
                  className={`mt-0.5 flex h-4 w-4 items-center justify-center rounded-full border ${
                    selected
                      ? "border-[#D4A017]"
                      : "border-neutral-400"
                  }`}
                >
                  {selected && (
                    <span className="h-2 w-2 rounded-full bg-[#D4A017]" />
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold">
                    {method.title}
                  </p>

                  <p className="mt-2 text-[9px] font-semibold text-neutral-600">
                    {method.details}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <label className="mt-3 flex cursor-pointer items-center gap-2 text-[10px]">
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={(event) =>
            onTermsChange(
              event.target.checked,
            )
          }
          className="h-4 w-4 accent-[#D4A017]"
        />

        <span>
          I agree to the{" "}
          <span className="font-semibold text-blue-600">
            Terms & Conditions
          </span>{" "}
          <span className="text-red-500">*</span>
        </span>
      </label>
    </section>
  );
}