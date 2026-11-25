"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowRight, MapPin, Package, ShoppingBag, Truck } from "lucide-react";
import { useCustomer } from "../hooks/use-customer";
import { useOrders } from "../hooks/use-orders";
import { useAuth } from "@/modules/auth/hooks/use-auth";

const money = (value: number) => `${value.toLocaleString()} XAF`;
const dateLabel = (value: string) => new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
const statusColor = (status: string) => status === "DELIVERED" ? "bg-green-100 text-green-700" : status === "CANCELLED" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800";

export function AccountDashboard() {
  const { isAuthenticated } = useAuth();
  const { customer, addresses, isLoading, error, errorStatusCode, getProfile, getAddresses } = useCustomer();
  const { orders, isLoading: ordersLoading, getOrders } = useOrders();

  useEffect(() => {
    void getProfile().catch(() => undefined);
    void getAddresses().catch(() => undefined);
    void getOrders().catch(() => undefined);
  }, [getProfile, getAddresses, getOrders]);

  const delivered = orders.filter((order) => order.status === "DELIVERED").length;
  const active = orders.filter((order) => !["DELIVERED", "CANCELLED"].includes(order.status)).length;
  const recentOrders = [...orders].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 4);
  const defaultAddress = addresses.find((address) => address.isDefault) ?? addresses[0];

  if (!isLoading && !customer && errorStatusCode !== null && [401, 403, 404].includes(errorStatusCode)) {
    return <section className="mx-auto max-w-lg border border-neutral-200 bg-white p-6 text-center sm:p-8">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#a36a00]">Customer account</p>
      <h1 className="mt-2 text-xl font-bold text-neutral-900">You don’t have a customer account yet</h1>
      <p className="mt-2 text-sm leading-6 text-neutral-600">Your current sign-in does not have a customer profile linked. You can still keep your influencer account and shop with a customer account. Sign in with a customer profile or create one to view orders, manage addresses, and update your profile.</p>
      <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">{!isAuthenticated && <Link href="/login?returnUrl=%2Faccount" className="inline-flex h-10 items-center justify-center bg-[#d28a00] px-5 text-xs font-bold text-white hover:bg-[#b87700]">Sign in</Link>}<Link href="/register" className="inline-flex h-10 items-center justify-center border border-neutral-300 px-5 text-xs font-bold text-neutral-800 hover:border-[#d28a00]">Create customer account</Link></div>
    </section>;
  }

  if (!isLoading && error && !customer) {
    return <section className="mx-auto max-w-lg border border-neutral-200 bg-white p-6 text-center"><h1 className="text-lg font-bold">We couldn&apos;t load your account</h1><p role="alert" className="mt-2 text-sm text-neutral-600">{error}</p><button onClick={() => void getProfile().catch(() => undefined)} className="mt-4 h-10 bg-[#d28a00] px-5 text-xs font-bold text-white">Try again</button></section>;
  }

  return <section className="space-y-5">
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#a36a00]">My Account</p>
        <h1 className="mt-1 text-xl font-bold text-neutral-900">Welcome back{customer?.firstName ? `, ${customer.firstName}` : ""}!</h1>
        <p className="mt-1 text-xs text-neutral-500">Here’s what’s happening with your account today.</p></div>
      <Link href="/shop" className="inline-flex h-9 items-center gap-2 bg-[#d28a00] px-4 text-[11px] font-bold text-white hover:bg-[#b87700]">Continue Shopping<ArrowRight size={14}/></Link>
    </header>

    {(error && !customer) && <p role="alert" className="border border-red-200 bg-red-50 p-3 text-xs text-red-700">{error}</p>}

    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {[
        { label: "Total Orders", value: ordersLoading ? "—" : orders.length, Icon: ShoppingBag, tint: "bg-amber-50 text-[#ba7900]" },
        { label: "In Progress", value: ordersLoading ? "—" : active, Icon: Package, tint: "bg-blue-50 text-blue-700" },
        { label: "Delivered", value: ordersLoading ? "—" : delivered, Icon: Truck, tint: "bg-green-50 text-green-700" },
        { label: "Total Spent", value: ordersLoading ? "—" : money(orders.reduce((sum, order) => sum + order.totalAmount, 0)), Icon: MapPin, tint: "bg-orange-50 text-orange-700" },
      ].map(({ label, value, Icon, tint }) => <article key={label} className="flex min-h-[80px] items-center gap-3 border border-neutral-200 bg-white p-4">
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${tint}`}><Icon size={17}/></span>
        <div><p className="text-[10px] text-neutral-500">{label}</p><p className="mt-1 text-base font-bold text-neutral-900">{value}</p></div>
      </article>)}
    </div>

    <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
      <section className="border border-neutral-200 bg-white">
        <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3"><h2 className="text-sm font-bold">Recent Orders</h2><Link href="/account/orders" className="text-[10px] font-semibold text-[#9b6400] hover:underline">View All</Link></div>
        {recentOrders.length ? <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left text-[10px]"><thead className="bg-neutral-50 text-neutral-500"><tr><th className="px-4 py-2.5 font-semibold">Order #</th><th className="px-3 py-2.5 font-semibold">Date</th><th className="px-3 py-2.5 font-semibold">Total</th><th className="px-3 py-2.5 font-semibold">Status</th><th className="px-4 py-2.5 text-right font-semibold">Action</th></tr></thead><tbody>{recentOrders.map((order) => <tr key={order.id} className="border-t border-neutral-100"><td className="px-4 py-3 font-semibold">#{order.orderNumber}</td><td className="px-3 py-3 text-neutral-600">{dateLabel(order.createdAt)}</td><td className="px-3 py-3 font-medium">{money(order.totalAmount)}</td><td className="px-3 py-3"><span className={`inline-flex rounded px-2 py-1 text-[9px] font-semibold ${statusColor(order.status)}`}>{order.status.toLowerCase().replaceAll("_", " ")}</span></td><td className="px-4 py-3 text-right"><Link href={`/account/orders/${order.id}`} className="font-semibold text-[#9b6400] hover:underline">View Order</Link></td></tr>)}</tbody></table></div> : <div className="px-4 py-9 text-center text-xs text-neutral-500">{ordersLoading ? "Loading your orders…" : "No orders yet. Your purchases will appear here."}</div>}
      </section>

      <section className="border border-neutral-200 bg-white">
        <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3"><h2 className="text-sm font-bold">Account Overview</h2><Link href="/account/profile" className="text-[10px] font-semibold text-[#9b6400] hover:underline">Edit Profile</Link></div>
        <div className="space-y-4 p-4 text-xs">
          <div><p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">Name</p><p className="mt-1 font-medium">{customer ? `${customer.firstName} ${customer.lastName}` : isLoading ? "Loading…" : "—"}</p></div>
          <div><p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">Phone</p><p className="mt-1 font-medium">{customer?.phone || "Add a phone number"}</p></div>
          <div className="border-t border-neutral-100 pt-3"><div className="flex items-center justify-between"><p className="font-semibold">Default Address</p><Link href="/account/addresses" className="text-[10px] font-semibold text-[#9b6400] hover:underline">Manage Address</Link></div>
            {defaultAddress ? <div className="mt-2 text-neutral-600"><p className="font-medium text-neutral-800">{defaultAddress.city}{defaultAddress.region ? `, ${defaultAddress.region}` : ""}</p><p className="mt-1">{defaultAddress.address}, {defaultAddress.country}</p></div> : <Link href="/account/addresses" className="mt-2 inline-block text-neutral-500 hover:text-[#9b6400]">Add a delivery address</Link>}</div>
        </div>
      </section>
    </div>
  </section>;
}
