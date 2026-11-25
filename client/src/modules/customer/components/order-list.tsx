"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";
import { useOrders } from "../hooks/use-orders";

const tabs = ["All Orders", "Processing", "Shipped", "Delivered", "Cancelled"] as const;
const statusColor = (status: string) => status === "DELIVERED" ? "bg-green-100 text-green-700" : status === "CANCELLED" ? "bg-red-100 text-red-700" : status === "SHIPPED" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-800";

export function OrderList() {
  const { orders, isLoading, error, getOrders } = useOrders();
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("All Orders");
  useEffect(() => { void getOrders(); }, [getOrders]);
  const filtered = useMemo(() => activeTab === "All Orders" ? orders : orders.filter((order) => order.status.toLowerCase() === activeTab.toLowerCase()), [activeTab, orders]);

  return <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200">
      <nav aria-label="Order status" className="flex gap-5 overflow-x-auto">{tabs.map((tab) => <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`whitespace-nowrap border-b-2 px-1 pb-3 text-[11px] font-semibold ${activeTab === tab ? "border-[#d28a00] text-[#a46a00]" : "border-transparent text-neutral-500 hover:text-neutral-800"}`}>{tab}</button>)}</nav>
      <Link href="/account/track-order" className="mb-2 text-[10px] font-semibold text-[#9b6400] hover:underline">Track an order</Link>
    </div>
    {error && <div role="alert" className="border border-red-200 bg-red-50 p-3 text-xs text-red-700">{error}</div>}
    <section className="overflow-hidden border border-neutral-200 bg-white">
      {isLoading && orders.length === 0 ? <p className="p-8 text-center text-xs text-neutral-500">Loading your orders…</p> : filtered.length === 0 ? <div className="p-10 text-center"><h2 className="text-sm font-semibold">No {activeTab === "All Orders" ? "orders" : activeTab.toLowerCase() + " orders"} found</h2><p className="mt-2 text-xs text-neutral-500">Orders matching this view will appear here.</p></div> : <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-[10px]"><thead className="bg-neutral-50 text-neutral-600"><tr><th className="px-4 py-3 font-semibold">Order #</th><th className="px-3 py-3 font-semibold">Date</th><th className="px-3 py-3 font-semibold">Total</th><th className="px-3 py-3 font-semibold">Payment</th><th className="px-3 py-3 font-semibold">Status</th><th className="px-4 py-3 text-right font-semibold">Action</th></tr></thead><tbody>{filtered.map((order) => <tr key={order.id} className="border-t border-neutral-100"><td className="px-4 py-3 font-semibold text-neutral-900">#{order.orderNumber}</td><td className="px-3 py-3 text-neutral-600">{new Date(order.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td><td className="px-3 py-3 font-medium">{order.totalAmount.toLocaleString()} XAF</td><td className="px-3 py-3"><span className={`inline-flex rounded px-2 py-1 text-[9px] font-semibold ${order.payment?.status === "PAID" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-800"}`}>{order.payment?.status?.toLowerCase() ?? "pending"}</span></td><td className="px-3 py-3"><span className={`inline-flex rounded px-2 py-1 text-[9px] font-semibold capitalize ${statusColor(order.status)}`}>{order.status.toLowerCase().replaceAll("_", " ")}</span></td><td className="px-4 py-3 text-right"><Link aria-label={`View order ${order.orderNumber}`} href={`/account/orders/${order.id}`} className="inline-flex h-7 items-center gap-1 border border-neutral-200 px-2 font-semibold text-neutral-700 hover:border-[#d28a00] hover:text-[#9b6400]"><Eye size={12}/>View Order</Link></td></tr>)}</tbody></table></div>}
    </section>
    <p className="text-[10px] text-neutral-500">Showing {filtered.length} of {orders.length} orders</p>
  </div>;
}
