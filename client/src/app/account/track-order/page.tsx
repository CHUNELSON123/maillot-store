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
        <h1 className="text-xl font-bold text-neutral-900">
          Track Order
        </h1>

        <p className="mt-1 text-xs text-neutral-500">
          Enter your order number to check its status and delivery tracking.
        </p>
      </div>

      <div className="max-w-2xl border border-neutral-200 bg-white p-5 sm:p-6">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <div>
            <label
              htmlFor="orderId"
              className="mb-1 block text-[10px] font-semibold text-neutral-900"
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
              className="h-9 w-full border border-neutral-300 px-3 text-xs outline-none transition focus:border-[#D4AF37] sm:min-w-[300px]"
            />
          </div>

          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isSearching}
            className="h-9 shrink-0 bg-[#d28a00] px-6 text-[10px] font-bold text-white transition hover:bg-[#b87700]"
          >
            {isSearching ? "SEARCHING..." : "TRACK ORDER"}
          </button>
        </form>
      </div>
    </section>
  );
}
