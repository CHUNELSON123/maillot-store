"use client";

import Link from "next/link";
import { Order } from "../types/order.types";

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const orderDate = new Date(order.createdAt).toLocaleDateString();

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-medium uppercase text-neutral-500">
            Order
          </p>

          <h3 className="mt-1 font-semibold text-neutral-900">
            #{order.orderNumber}
          </h3>

          <p className="mt-1 text-sm text-neutral-500">
            {orderDate}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium capitalize text-neutral-700">
            {order.status}
          </span>

          <span className="font-semibold text-neutral-900">
            {order.totalAmount.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3 border-t border-neutral-100 pt-4">
        <Link
          href={`/account/orders/${order.id}`}
          className="text-sm font-semibold text-[#8f741d] hover:underline"
        >
          VIEW ORDER
        </Link>

        <Link
          href={`/account/track-order/${order.id}`}
          className="text-sm font-semibold text-neutral-700 hover:text-[#8f741d]"
        >
          TRACK ORDER
        </Link>
      </div>
    </div>
  );
}