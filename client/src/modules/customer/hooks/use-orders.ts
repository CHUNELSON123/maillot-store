"use client";

import { useCallback, useState } from "react";
import { orderService } from "../services/order.service";
import { Order } from "../types/order.types";

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const getOrders = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const data = await orderService.getOrders();
      setOrders(data);
      return data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to load your orders.";

      setError(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getOrder = useCallback(async (id: string) => {
    setIsLoading(true);
    setError("");

    try {
      const data = await orderService.getOrder(id);
      setOrder(data);
      return data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to load this order.";

      setError(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    orders,
    order,
    isLoading,
    error,
    getOrders,
    getOrder,
  };
}