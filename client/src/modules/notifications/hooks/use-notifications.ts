"use client";

import { useCallback, useEffect, useState } from "react";
import { notificationService } from "../services/notification.service";
import { Notification } from "../types/notification.types";

export function useNotifications(enabled = true) {
  const [notifications, setNotifications] = useState<
    Notification[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotifications = useCallback(async () => {
    try {
      setError("");
      setIsLoading(true);

      const data =
        await notificationService.getNotifications();

      setNotifications(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load notifications.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    void loadNotifications();
    const refresh = () => { void loadNotifications(); };
    const interval = window.setInterval(refresh, 30000);
    window.addEventListener("focus", refresh);
    window.addEventListener("maillot-notifications-updated", refresh);
    return () => { window.clearInterval(interval); window.removeEventListener("focus", refresh); window.removeEventListener("maillot-notifications-updated", refresh); };
  }, [loadNotifications, enabled]);

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id
            ? { ...notification, isRead: true }
            : notification,
        ),
      );
      setError("");
      window.dispatchEvent(new Event("maillot-notifications-updated"));
    } catch {
      setError("Unable to mark this notification as read.");
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((current) =>
        current.map((notification) => ({ ...notification, isRead: true })),
      );
      setError("");
      window.dispatchEvent(new Event("maillot-notifications-updated"));
    } catch {
      setError("Unable to mark notifications as read.");
    }
  };

  return {
    notifications,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    reload: loadNotifications,
  };
}
