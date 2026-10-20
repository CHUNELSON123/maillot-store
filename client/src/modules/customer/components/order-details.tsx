"use client";

import { useEffect, useState } from "react";
import { useOrders } from "../hooks/use-orders";
import {
  CustomerDelivery,
  deliveryService,
} from "../services/delivery.service";

interface OrderDetailsProps {
  orderId: string;
  tracking?: boolean;
}

export function OrderDetails({ orderId, tracking = false }: OrderDetailsProps) {
  const { order, isLoading, error, getOrder } = useOrders();
  const [delivery, setDelivery] = useState<CustomerDelivery | null>(null);
  const [deliveryError, setDeliveryError] = useState("");

  useEffect(() => {
    setDelivery(null);
    setDeliveryError("");
    void getOrder(orderId)
      .then(async (loadedOrder) => {
        if (tracking && loadedOrder.deliveryMethod === "DELIVERY") {
          try {
            setDelivery(await deliveryService.getForOrder(orderId));
          } catch (deliveryLoadError) {
            const message =
              deliveryLoadError instanceof Error
                ? deliveryLoadError.message.toLowerCase()
                : "";
            if (!message.includes("not found") && !message.includes("404")) {
              setDeliveryError("Delivery tracking is temporarily unavailable.");
            }
          }
        }
      })
      .catch(() => undefined);
  }, [getOrder, orderId, tracking]);

  if (isLoading && !order) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center">
        <p className="text-sm text-neutral-500">Loading order...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center">
        <p className="text-sm text-neutral-500">Order not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-neutral-200 bg-white p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="text-xs font-medium uppercase text-neutral-500">Order</p>
            <h2 className="mt-1 text-xl font-semibold text-neutral-900">
              #{order.orderNumber}
            </h2>
            <p className="mt-2 text-sm text-neutral-500">
              Placed on {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <span className="w-fit rounded-full bg-neutral-100 px-4 py-2 text-sm font-medium capitalize text-neutral-700">
            {order.status.toLowerCase().replaceAll("_", " ")}
          </span>
        </div>
      </div>

      {tracking && (
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-neutral-900">Delivery Tracking</h2>
          <div className="mt-4 space-y-2 text-sm">
            {order.deliveryMethod === "PICKUP" ? (
              <p>Pickup order status: {order.status.toLowerCase().replaceAll("_", " ")}.</p>
            ) : delivery ? (
              <>
                <p className="font-medium">
                  Delivery status: {delivery.deliveryStatus.toLowerCase().replaceAll("_", " ")}
                </p>
                {delivery.provider && <p>Provider: {delivery.provider}</p>}
                {delivery.trackingNumber && <p>Tracking number: {delivery.trackingNumber}</p>}
                {delivery.deliveredAt && (
                  <p>Delivered: {new Date(delivery.deliveredAt).toLocaleString()}</p>
                )}
              </>
            ) : deliveryError ? (
              <p role="status" className="text-neutral-500">{deliveryError}</p>
            ) : (
              <p className="text-neutral-500">
                Order status: {order.status.toLowerCase().replaceAll("_", " ")}. No delivery tracking record has been assigned yet.
              </p>
            )}
          </div>
          {order.deliveryAddress && (
            <p className="mt-4 text-sm text-neutral-500">
              Delivery address: {[order.deliveryAddress, order.deliveryCity, order.deliveryPostalCode].filter(Boolean).join(", ")}
            </p>
          )}
        </div>
      )}

      <div className="rounded-lg border border-neutral-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-neutral-900">Order Items</h2>
        <div className="mt-5 divide-y divide-neutral-100">
          {order.items.map((item) => (
            <div key={item.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-neutral-900">{item.productName ?? "Product"}</p>
                <p className="mt-1 text-sm text-neutral-500">
                  {[item.sku && `SKU: ${item.sku}`, item.size && `Size: ${item.size}`, item.color && `Color: ${item.color}`].filter(Boolean).join(" · ") || `Variant: ${item.variantId}`}
                </p>
                <p className="mt-1 text-sm text-neutral-500">Quantity: {item.quantity}</p>
              </div>
              <p className="font-semibold text-neutral-900">
                {(item.unitPrice * item.quantity).toLocaleString()} FCFA
              </p>
            </div>
          ))}
        </div>
        <div className="mt-5 border-t border-neutral-200 pt-5">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500">Influencer Discount</span>
            <span className="text-neutral-700">-{order.influencerDiscountAmount.toLocaleString()} FCFA</span>
          </div>
          {order.deliveryFee !== undefined && (
            <div className="mt-3 flex justify-between text-sm">
              <span className="text-neutral-500">Delivery</span>
              <span>{order.deliveryFee.toLocaleString()} FCFA</span>
            </div>
          )}
          <div className="mt-3 flex justify-between">
            <span className="font-semibold text-neutral-900">Total</span>
            <span className="font-semibold text-neutral-900">{order.totalAmount.toLocaleString()} FCFA</span>
          </div>
        </div>
      </div>
    </div>
  );
}
