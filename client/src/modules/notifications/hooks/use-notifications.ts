"use client";

import { useCallback, useEffect, useState } from "react";
import { notificationService } from "../services/notification.service";
import { Notification } from "../types/notification.types";

export function useNotifications() {
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
    void loadNotifications();
  }, [loadNotifications]);

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
