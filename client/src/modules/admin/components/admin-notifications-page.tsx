'use client';

import { useRouter } from 'next/navigation';
import { Bell, CheckCheck } from 'lucide-react';
import { useNotifications } from '@/modules/notifications/hooks/use-notifications';
import type { Notification } from '@/modules/notifications/types/notification.types';

function destination(item: Notification): string {
  const target = item.targetUrl;
  if (target && /^\/admin\/(orders|inventory|influencers|payments|delivery|customers)(?:[/?#]|$)/.test(target) && !/[\\\x00-\x1f]/.test(target)) return target;
  const fallback: Record<string, string> = { ORDER: '/admin/orders', INVENTORY: '/admin/inventory', INFLUENCER: '/admin/influencers', COMMISSION: '/admin/influencers', WITHDRAWAL: '/admin/influencers', PAYMENT: '/admin/payments', DELIVERY: '/admin/delivery' };
  return fallback[item.type] ?? '/admin/dashboard';
}

export function AdminNotificationsPage() {
  const router = useRouter();
  const { notifications, isLoading, error, markAsRead, markAllAsRead } = useNotifications();
  const unread = notifications.filter((item) => !item.isRead).length;
  const open = async (item: Notification) => {
    if (!item.isRead) await markAsRead(item.id);
    router.push(destination(item));
  };
  return <section className="mx-auto max-w-5xl">
    <header className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-bold">Notifications</h1><p className="mt-1 text-sm text-neutral-600">Review store activity and open the related record. {unread} unread.</p></div><button type="button" disabled={!unread} onClick={() => void markAllAsRead()} className="inline-flex items-center gap-2 border border-neutral-300 bg-white px-4 py-2 text-xs font-semibold disabled:opacity-50"><CheckCheck size={15}/>Mark all as read</button></header>
    {error && <p role="alert" className="mb-3 border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="divide-y border border-neutral-200 bg-white">
      {isLoading && notifications.length === 0 ? <p role="status" className="p-8 text-center text-sm text-neutral-500">Loading notifications...</p> : notifications.length === 0 ? <p className="p-8 text-center text-sm text-neutral-500">No notifications yet.</p> : notifications.map((item) => <button key={item.id} type="button" onClick={() => void open(item)} className={`flex w-full items-start gap-3 p-4 text-left transition hover:bg-amber-50 ${item.isRead ? 'bg-white' : 'bg-amber-50/60'}`}><span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-800"><Bell size={16}/></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{item.title}{!item.isRead && <span className="ml-2 text-[10px] font-bold uppercase text-amber-700">New</span>}</span><span className="mt-1 block text-xs text-neutral-600">{item.message}</span><time className="mt-2 block text-[10px] text-neutral-500" dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString()}</time></span><span className="shrink-0 text-xs font-semibold text-amber-700">View</span></button>)}
    </div>
  </section>;
}
