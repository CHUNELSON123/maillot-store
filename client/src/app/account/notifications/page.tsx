"use client";

import { CustomerLayout } from "@/modules/customer/components/customer-layout";
import { NotificationList } from "@/modules/notifications/components/notification-list";
import { useNotifications } from "@/modules/notifications/hooks/use-notifications";

export default function NotificationsPage() {
  const {
    notifications,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  return (
    <CustomerLayout>
      <section>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">
              Notifications
            </h1>

            <p className="mt-2 text-sm text-neutral-500">
              Stay updated with your account and orders.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="text-left text-sm font-medium text-blue-700 hover:underline sm:text-right"
            >
              Mark all as read
            </button>
          )}
        </div>

        {isLoading && (
          <div className="rounded-lg border border-neutral-200 bg-white px-6 py-12 text-center text-sm text-neutral-500">
            Loading notifications...
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {!isLoading && !error && (
          <NotificationList
            notifications={notifications}
            onMarkAsRead={markAsRead}
          />
        )}
      </section>
    </CustomerLayout>
  );
}