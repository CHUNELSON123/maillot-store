"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CustomerLayout } from "@/modules/customer/components/customer-layout";

export default function TrackOrderPage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState("");

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const trimmedId = orderId.trim();

    if (!trimmedId) {
      return;
    }

    router.push(`/account/track-order/${trimmedId}`);
  };

  return (
    <CustomerLayout>
      <section>
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-neutral-900">
            Track Order
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            Enter your order ID to check its current status.
          </p>
        </div>

        <div className="max-w-xl rounded-lg border border-neutral-200 bg-white p-6 sm:p-8">
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="orderId"
                className="mb-2 block text-sm font-medium text-neutral-900"
              >
                Order ID
              </label>

              <input
                id="orderId"
                type="text"
                value={orderId}
                onChange={(event) =>
                  setOrderId(event.target.value)
                }
                placeholder="Enter your order ID"
                required
                className="h-12 w-full rounded-md border border-neutral-300 px-4 text-sm outline-none transition focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
              />
            </div>

            <button
              type="submit"
              className="h-12 w-full rounded-md bg-[#D4AF37] px-6 text-sm font-semibold text-white transition hover:bg-[#bf9828]"
            >
              TRACK ORDER
            </button>
          </form>
        </div>
      </section>
    </CustomerLayout>
  );
}