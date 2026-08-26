"use client";

import { useEffect } from "react";
import { useOrders } from "../hooks/use-orders";

interface OrderDetailsProps {
  orderId: string;
  tracking?: boolean;
}

export function OrderDetails({
  orderId,
  tracking = false,
}: OrderDetailsProps) {
  const {
    order,
    isLoading,
    error,
    getOrder,
  } = useOrders();

  useEffect(() => {
    void getOrder(orderId);
  }, [getOrder, orderId]);

  if (isLoading && !order) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center">
        <p className="text-sm text-neutral-500">
          Loading order...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center">
        <p className="text-sm text-neutral-500">
          Order not found.
        </p>
      </div>
    );
  }

  const orderDate = new Date(
    order.createdAt,
  ).toLocaleDateString();

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-neutral-200 bg-white p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="text-xs font-medium uppercase text-neutral-500">
              Order
            </p>

            <h2 className="mt-1 text-xl font-semibold text-neutral-900">
              #{order.orderNumber}
            </h2>

            <p className="mt-2 text-sm text-neutral-500">
              Placed on {orderDate}
            </p>
          </div>

          <span className="w-fit rounded-full bg-neutral-100 px-4 py-2 text-sm font-medium capitalize text-neutral-700">
            {order.status}
          </span>
        </div>
      </div>

      {tracking && (
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-neutral-900">
            Order Tracking
          </h2>

          <div className="mt-6">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-[#D4AF37]" />

              <p className="text-sm font-medium capitalize text-neutral-900">
                {order.status}
              </p>
            </div>

            <div className="ml-1.5 mt-2 h-12 border-l border-neutral-200" />

            <p className="text-sm text-neutral-500">
              Your order is currently marked as{" "}
              <span className="font-medium text-neutral-700">
                {order.status}
              </span>
              .
            </p>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-neutral-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-neutral-900">
          Order Items
        </h2>

        <div className="mt-5 divide-y divide-neutral-100">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-neutral-900">
                  Product Variant
                </p>

                <p className="mt-1 text-sm text-neutral-500">
                  Variant: {item.variantId}
                </p>

                <p className="mt-1 text-sm text-neutral-500">
                  Quantity: {item.quantity}
                </p>
              </div>

              <p className="font-semibold text-neutral-900">
                {(
                  item.unitPrice * item.quantity
                ).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 border-t border-neutral-200 pt-5">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500">
              Influencer Discount
            </span>

            <span className="text-neutral-700">
              -{order.influencerDiscountAmount.toLocaleString()}
            </span>
          </div>

          <div className="mt-3 flex justify-between">
            <span className="font-semibold text-neutral-900">
              Total
            </span>

            <span className="font-semibold text-neutral-900">
              {order.totalAmount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}