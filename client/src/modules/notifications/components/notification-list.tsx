"use client";

import { Bell } from "lucide-react";
import { NotificationItem } from "./notification-item";
import { Notification } from "../types/notification.types";

type Props = {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
};

export function NotificationList({
  notifications,
  onMarkAsRead,
}: Props) {
  if (notifications.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white px-6 py-12 text-center">
        <Bell
          size={32}
          className="mx-auto text-neutral-300"
        />

        <p className="mt-4 text-sm font-medium text-neutral-900">
          No notifications
        </p>

        <p className="mt-1 text-sm text-neutral-500">
          You&apos;re all caught up.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkAsRead={onMarkAsRead}
        />
      ))}
    </div>
  );
}