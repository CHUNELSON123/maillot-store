"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { orderService } from "@/modules/customer/services/order.service";

export default function TrackOrderPage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const trimmedId = orderId.trim();

    if (!trimmedId) {
      return;
    }

    setIsSearching(true);
    setError("");
    try {
      const order = await orderService.getOrderByNumber(trimmedId);
      router.push(`/account/track-order/${encodeURIComponent(order.id)}`);
    } catch {
      setError("We could not find an order with that number in your account.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <section>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900">
          Track Order
        </h1>

        <p className="mt-2 text-sm text-neutral-500">
          Enter your order number to check its status and delivery tracking.
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
              Order Number
            </label>

            <input
              id="orderId"
              type="text"
              value={orderId}
              onChange={(event) =>
                setOrderId(event.target.value)
              }
              placeholder="e.g. ORD-123456789"
              required
              className="h-12 w-full rounded-md border border-neutral-300 px-4 text-sm outline-none transition focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
            />
          </div>

          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isSearching}
            className="h-12 w-full rounded-md bg-[#D4AF37] px-6 text-sm font-semibold text-white transition hover:bg-[#bf9828]"
          >
            {isSearching ? "SEARCHING..." : "TRACK ORDER"}
          </button>
        </form>
      </div>
    </section>
  );
}
