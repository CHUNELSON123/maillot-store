"use client";

import { Bell } from "lucide-react";
import { Notification } from "../types/notification.types";

type Props = {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
};

export function NotificationItem({
  notification,
  onMarkAsRead,
}: Props) {
  return (
    <button
      type="button"
      onClick={() =>
        !notification.isRead &&
        onMarkAsRead(notification.id)
      }
      className={`w-full border-b border-neutral-200 px-4 py-5 text-left transition last:border-b-0 hover:bg-neutral-50 ${
        notification.isRead ? "bg-white" : "bg-amber-50/40"
      }`}
    >
      <div className="flex gap-4">
        <div className="mt-0.5 shrink-0">
          <Bell
            size={20}
            className={
              notification.isRead
                ? "text-neutral-400"
                : "text-[#D4AF37]"
            }
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-sm font-semibold text-neutral-900">
              {notification.title}
            </h3>

            {!notification.isRead && (
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#D4AF37]" />
            )}
          </div>

          <p className="mt-1 text-sm leading-6 text-neutral-600">
            {notification.message}
          </p>

          <p className="mt-2 text-xs text-neutral-400">
            {new Date(notification.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </button>
  );
}