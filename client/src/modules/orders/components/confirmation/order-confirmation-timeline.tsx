"use client";

import {
  CheckCircle2,
  ClipboardList,
  Package,
  Truck,
} from "lucide-react";

const steps = [
  {
    title: "1. Order Received",
    description: "We have received your order and are reviewing it.",
    icon: ClipboardList,
  },
  {
    title: "2. Processing",
    description: "We are preparing your items for shipment.",
    icon: Package,
  },
  {
    title: "3. Shipped",
    description: "Your order is on the way. We will notify you.",
    icon: Truck,
  },
  {
    title: "4. Delivered",
    description: "Your order will be delivered to your doorstep.",
    icon: CheckCircle2,
  },
];

export function OrderConfirmationTimeline() {
  return (
    <div className="rounded-[8px] border border-neutral-200 bg-white px-4 py-4">
      <h2 className="text-[13px] font-extrabold uppercase">
        WHAT HAPPENS NEXT?
      </h2>

      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-4 sm:gap-0">
        {steps.map((step, index) => {
          const Icon = step.icon;

          return (
            <div
              key={step.title}
              className="relative flex flex-col items-center text-center"
            >
              {index < steps.length - 1 && (
                <div className="absolute left-[calc(50%+32px)] right-[-50%] top-[23px] hidden border-t border-dashed border-neutral-400 sm:block" />
              )}

              <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-[#D4AF37] bg-white">
                <Icon
                  size={21}
                  strokeWidth={1.8}
                />
              </div>

              <h3 className="mt-2 text-[9px] font-extrabold">
                {step.title}
              </h3>

              <p className="mt-1 max-w-[145px] text-[8px] leading-4 text-neutral-600">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}