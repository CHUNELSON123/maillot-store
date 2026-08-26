"use client";

import { useEffect } from "react";
import { useOrders } from "../hooks/use-orders";
import { OrderCard } from "./order-card";

export function OrderList() {
  const {
    orders,
    isLoading,
    error,
    getOrders,
  } = useOrders();

  useEffect(() => {
    void getOrders();
  }, [getOrders]);

  if (isLoading && orders.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center">
        <p className="text-sm text-neutral-500">
          Loading your orders...
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

  if (orders.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center">
        <h2 className="font-semibold text-neutral-900">
          No orders yet
        </h2>

        <p className="mt-2 text-sm text-neutral-500">
          Your orders will appear here once you make a
          purchase.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
        />
      ))}
    </div>
  );
}