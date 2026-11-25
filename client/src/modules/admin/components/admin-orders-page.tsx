'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Eye, Filter, Search, X } from 'lucide-react';
import { adminService } from '../services/admin.service';
import { AdminPage, AdminRecord } from '../types/admin.types';
import { AdminWalkInOrderDialog } from './admin-walk-in-order-dialog';
import { OrderReceipt } from '@/modules/orders/components/order-receipt';

type Order = AdminRecord & {
  id: string;
  order_number: string;
  source: string;
  status: string;
  total_amount: number | string;
  influencer_discount_amount?: number | string;
  created_at: string;
  guest_name?: string | null;
  guest_email?: string | null;
  guest_phone?: string | null;
  delivery_method?: string;
  delivery_address?: string | null;
  delivery_city?: string | null;
  delivery_postal_code?: string | null;
  delivery_fee?: number | string;
  customer?: { first_name?: string; last_name?: string; user?: { email?: string } } | null;
  payment?: { status?: string; payment_method?: { name?: string } } | null;
  delivery?: { delivery_status?: string; provider?: string | null; tracking_number?: string | null } | null;
  items?: Array<{ quantity: number; unit_price: number | string; variant?: { size?: string; color?: string; sku?: string; product?: { name?: string } } }>;
};

const PAGE_SIZE = 5;
const orderStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const channels = [
  { label: 'All Orders', value: '' },
  { label: 'Website Orders', value: 'WEBSITE' },
  { label: 'Walk-in Orders', value: 'WALK_IN' },
  { label: 'WhatsApp Orders', value: 'WHATSAPP' },
  { label: 'Phone Orders', value: 'PHONE' },
];

const money = (value: unknown) => Number(value ?? 0).toLocaleString('en-US', { maximumFractionDigits: 0 });
const customerName = (order: Order) => [order.customer?.first_name, order.customer?.last_name].filter(Boolean).join(' ') || order.guest_name || 'Guest Customer';
const label = (value?: string | null) => (value || '—').replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());

function pillClass(value?: string | null) {
  const status = value?.toUpperCase() ?? '';
  if (['PAID', 'CONFIRMED', 'DELIVERED', 'COMPLETED'].includes(status)) return 'bg-green-50 text-green-700';
  if (['PROCESSING', 'PENDING'].includes(status)) return 'bg-amber-50 text-amber-700';
  if (['SHIPPED', 'IN_TRANSIT', 'ASSIGNED'].includes(status)) return 'bg-blue-50 text-blue-700';
  if (['FAILED', 'CANCELLED', 'REJECTED'].includes(status)) return 'bg-red-50 text-red-700';
  return 'bg-neutral-100 text-neutral-600';
}

function downloadCsv(rows: Order[]) {
  const columns = ['Order Number', 'Date', 'Customer', 'Email', 'Source', 'Total XAF', 'Payment Status', 'Delivery Status', 'Order Status'];
  const quote = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const lines = [columns.map(quote).join(','), ...rows.map((order) => [
    order.order_number,
    new Date(order.created_at).toLocaleString(),
    customerName(order),
    order.customer?.user?.email ?? order.guest_email,
    label(order.source),
    order.total_amount,
    order.payment?.status,
    order.delivery?.delivery_status,
    order.status,
  ].map(quote).join(','))];
  const url = URL.createObjectURL(new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'maillot-store-orders.csv'; anchor.click(); URL.revokeObjectURL(url);
}

export function AdminOrdersPage() {
  const [data, setData] = useState<AdminPage<AdminRecord>>({ items: [], total: 0, page: 1, limit: PAGE_SIZE });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [source, setSource] = useState('');
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Order | null>(null);
  const [nextStatus, setNextStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [showWalkIn, setShowWalkIn] = useState(false);

  useEffect(() => {
    setSearch(new URLSearchParams(window.location.search).get('search') ?? '');
  }, []);

  const loadOrders = useCallback(async (targetPage = 1) => {
    setLoading(true); setError('');
    try {
      const result = await adminService.getOrdersPage({
        page: targetPage,
        limit: PAGE_SIZE,
        search,
        status: status || undefined,
        paymentStatus: paymentStatus || undefined,
        source: source || undefined,
        startDate: startDate ? `${startDate}T00:00:00.000Z` : undefined,
        endDate: endDate ? `${endDate}T23:59:59.999Z` : undefined,
      });
      setData(result); setPage(targetPage);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not load orders.'); }
    finally { setLoading(false); }
  }, [search, status, paymentStatus, source, startDate, endDate]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadOrders(1), search ? 250 : 0);
    return () => window.clearTimeout(timer);
  }, [loadOrders, search]);

  const orders = data.items as Order[];
  const pages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));
  const changeFilter = (setter: (value: string) => void) => (event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setter(event.target.value); setPage(1);
  };

  const exportOrders = async () => {
    setExporting(true); setError('');
    try {
      const filters = {
        limit: 100,
        search,
        status: status || undefined,
        paymentStatus: paymentStatus || undefined,
        source: source || undefined,
        startDate: startDate ? `${startDate}T00:00:00.000Z` : undefined,
        endDate: endDate ? `${endDate}T23:59:59.999Z` : undefined,
      };
      const first = await adminService.getOrdersPage({ ...filters, page: 1 });
      const all = [...first.items] as Order[];
      for (let pageNumber = 2; pageNumber <= Math.ceil(first.total / 100); pageNumber += 1) {
        const next = await adminService.getOrdersPage({ ...filters, page: pageNumber });
        all.push(...next.items as Order[]);
      }
      downloadCsv(all);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not export orders.'); }
    finally { setExporting(false); }
  };

  const updateStatus = async () => {
    if (!selected || !nextStatus) return;
    setSaving(true); setActionError('');
    try {
      await adminService.updateOrderStatus(selected.id, nextStatus);
      setSelected(null); await loadOrders(page);
    } catch (cause) { setActionError(cause instanceof Error ? cause.message : 'Could not update order status.'); }
    finally { setSaving(false); }
  };

  return <div className="mx-auto max-w-[1400px] text-neutral-950">
    <div className="flex items-start justify-between gap-4"><div><h2 className="text-2xl font-black">Orders</h2><p className="mt-1 text-xs text-neutral-600">Manage and track all customer orders.</p></div><div className="flex gap-2"><button onClick={() => setShowWalkIn(true)} className="h-9 rounded bg-[#d48100] px-4 text-[11px] font-semibold text-white hover:bg-[#b96f00]">Record Walk-in Sale</button><button onClick={() => void exportOrders()} disabled={exporting} className="h-9 rounded border border-neutral-300 bg-white px-5 text-[11px] font-semibold hover:border-[#d28a00] disabled:opacity-50">{exporting ? 'Exporting…' : 'Export'}</button></div></div>
    <div className="mt-4 flex gap-6 overflow-x-auto border-b border-neutral-200">{channels.map((channel) => <button key={channel.value || 'all'} onClick={() => { setSource(channel.value); setPage(1); }} className={`whitespace-nowrap border-b-2 px-1 pb-3 text-[11px] font-semibold ${source === channel.value ? 'border-[#dc8c00] text-[#b26700]' : 'border-transparent text-neutral-600 hover:text-black'}`}>{channel.label}</button>)}</div>
    <div className="mt-3 grid gap-2 xl:grid-cols-[minmax(190px,1.5fr)_repeat(2,minmax(135px,1fr))_minmax(220px,1.35fr)_auto]">
      <label className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={15}/><input aria-label="Search orders" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search orders..." className="h-9 w-full rounded border border-neutral-300 bg-white pl-9 pr-3 text-[11px] outline-none focus:border-[#d28a00]"/></label>
      <select aria-label="Filter by order status" value={status} onChange={changeFilter(setStatus)} className="h-9 rounded border border-neutral-300 bg-white px-3 text-[11px]"><option value="">All Status</option>{orderStatuses.map((item) => <option key={item} value={item}>{label(item)}</option>)}</select>
      <select aria-label="Filter by payment status" value={paymentStatus} onChange={changeFilter(setPaymentStatus)} className="h-9 rounded border border-neutral-300 bg-white px-3 text-[11px]"><option value="">All Payment Status</option>{['PENDING', 'PAID', 'FAILED', 'CANCELLED'].map((item) => <option key={item} value={item}>{label(item)}</option>)}</select>
      <div className="flex items-center gap-2 rounded border border-neutral-300 bg-white px-2"><input aria-label="Start date" type="date" value={startDate} onChange={changeFilter(setStartDate)} className="min-w-0 flex-1 text-[10px] outline-none"/><span className="text-neutral-400">–</span><input aria-label="End date" type="date" value={endDate} onChange={changeFilter(setEndDate)} className="min-w-0 flex-1 text-[10px] outline-none"/></div>
      <button onClick={() => void loadOrders(1)} className="inline-flex h-9 items-center justify-center gap-2 rounded border border-neutral-300 bg-white px-4 text-[11px] font-semibold hover:border-[#d28a00]"><Filter size={14}/>Filter</button>
    </div>
    <section className="mt-3 overflow-hidden rounded border border-neutral-200 bg-white">
      {error ? <div role="alert" className="p-8 text-center text-sm text-red-700">{error}<button onClick={() => void loadOrders(page)} className="ml-2 underline">Retry</button></div> : loading ? <div className="p-10 text-center text-xs text-neutral-500">Loading orders…</div> : orders.length ? <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-[10px]"><thead className="bg-neutral-50 text-neutral-600"><tr>{['Order #', 'Date', 'Customer', 'Source', 'Total (XAF)', 'Payment', 'Delivery', 'Status', 'Actions'].map((heading) => <th key={heading} className="border-b border-neutral-200 px-3 py-2.5 font-semibold">{heading}</th>)}</tr></thead><tbody className="divide-y divide-neutral-100">{orders.map((order) => <tr key={order.id} className="hover:bg-neutral-50"><td className="whitespace-nowrap px-3 py-3 font-semibold">#{order.order_number}</td><td className="whitespace-nowrap px-3 py-3">{new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td><td className="px-3 py-3 font-medium">{customerName(order)}</td><td className="px-3 py-3">{label(order.source)}</td><td className="whitespace-nowrap px-3 py-3">{money(order.total_amount)}</td><td className="px-3 py-3"><span className={`rounded px-2 py-1 font-semibold ${pillClass(order.payment?.status)}`}>{label(order.payment?.status)}</span></td><td className="px-3 py-3"><span className={`rounded px-2 py-1 font-semibold ${pillClass(order.delivery?.delivery_status)}`}>{label(order.delivery?.delivery_status)}</span></td><td className="px-3 py-3"><span className={`rounded px-2 py-1 font-semibold ${pillClass(order.status)}`}>{label(order.status)}</span></td><td className="px-3 py-3"><button onClick={() => { setSelected(order); setNextStatus(order.status); setActionError(''); }} aria-label={`View order ${order.order_number}`} className="grid h-8 w-8 place-items-center rounded border border-neutral-200 text-neutral-600 hover:border-[#d28a00] hover:text-[#9b5c00]"><Eye size={15}/></button></td></tr>)}</tbody></table></div> : <div className="p-10 text-center text-xs text-neutral-500">No orders match these filters.</div>}
      {!error && !loading && <footer className="flex items-center justify-between gap-3 border-t border-neutral-100 px-4 py-3 text-xs text-neutral-500"><span>Showing {data.total ? (page - 1) * PAGE_SIZE + 1 : 0} to {Math.min(page * PAGE_SIZE, data.total)} of {data.total} orders</span><div className="flex items-center gap-1"><button aria-label="Previous page" disabled={page <= 1} onClick={() => void loadOrders(page - 1)} className="grid h-8 w-8 place-items-center rounded border border-neutral-200 disabled:opacity-40"><ChevronLeft size={15}/></button><span className="px-2">{page} / {pages}</span><button aria-label="Next page" disabled={page >= pages} onClick={() => void loadOrders(page + 1)} className="grid h-8 w-8 place-items-center rounded border border-neutral-200 disabled:opacity-40"><ChevronRight size={15}/></button></div></footer>}
    </section>

    {selected && <div role="dialog" aria-modal="true" aria-labelledby="order-detail-title" className="fixed inset-0 z-[60] grid place-items-center bg-black/50 p-4"><section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded border border-neutral-200 bg-white shadow-xl"><header className="flex items-center justify-between border-b border-neutral-200 px-5 py-4"><div><p className="text-[10px] font-semibold uppercase tracking-widest text-[#966800]">Order Details</p><h2 id="order-detail-title" className="mt-1 text-base font-bold">#{selected.order_number}</h2></div><button aria-label="Close" onClick={() => setSelected(null)}><X size={18}/></button></header><div className="px-5 pt-4"><OrderReceipt data={{ orderNumber: selected.order_number, orderDate: selected.created_at, customerName: customerName(selected), email: selected.customer?.user?.email ?? selected.guest_email ?? '', phone: selected.guest_phone ?? '', fulfillment: selected.delivery_method === 'PICKUP' ? 'Store pickup' : 'Delivery', paymentMethod: selected.payment?.payment_method?.name, paymentStatus: selected.payment?.status, items: (selected.items ?? []).map((item) => ({ name: item.variant?.product?.name ?? 'Product', variant: [item.variant?.size, item.variant?.color].filter(Boolean).join(' / '), sku: item.variant?.sku ?? '', quantity: item.quantity, unitPrice: Number(item.unit_price) })), subtotal: (selected.items ?? []).reduce((sum, item) => sum + Number(item.unit_price) * item.quantity, 0), discount: Number(selected.influencer_discount_amount ?? 0), deliveryFee: Number(selected.delivery_fee ?? 0), total: Number(selected.total_amount) }} /></div><div className="grid gap-3 p-5 sm:grid-cols-2"><p className="border p-3 text-xs"><span className="block text-[10px] text-neutral-500">Customer</span>{customerName(selected)}</p><p className="border p-3 text-xs"><span className="block text-[10px] text-neutral-500">Email</span>{selected.customer?.user?.email ?? selected.guest_email ?? '—'}</p><p className="border p-3 text-xs"><span className="block text-[10px] text-neutral-500">Source</span>{label(selected.source)}</p><p className="border p-3 text-xs"><span className="block text-[10px] text-neutral-500">Order date</span>{new Date(selected.created_at).toLocaleString()}</p><p className="border p-3 text-xs"><span className="block text-[10px] text-neutral-500">Payment</span>{label(selected.payment?.status)} · {label(selected.payment?.payment_method?.name)}</p><p className="border p-3 text-xs"><span className="block text-[10px] text-neutral-500">Delivery</span>{label(selected.delivery?.delivery_status ?? selected.delivery_method)}{selected.delivery?.tracking_number ? ` · ${selected.delivery.tracking_number}` : ''}</p><p className="border p-3 text-xs sm:col-span-2"><span className="block text-[10px] text-neutral-500">Delivery address</span>{[selected.delivery_address, selected.delivery_city, selected.delivery_postal_code].filter(Boolean).join(', ') || '—'}</p></div><div className="px-5 pb-4"><h3 className="mb-2 text-sm font-bold">Items</h3><div className="divide-y border-y">{selected.items?.map((item, index) => <div key={`${item.variant?.sku ?? 'item'}-${index}`} className="flex justify-between gap-3 py-3 text-xs"><span>{item.variant?.product?.name ?? 'Product'} · {[item.variant?.size, item.variant?.color].filter(Boolean).join(' / ') || item.variant?.sku} × {item.quantity}</span><strong>{money(Number(item.unit_price) * item.quantity)} XAF</strong></div>)}</div><div className="mt-3 flex justify-between text-sm font-bold"><span>Total</span><span>{money(selected.total_amount)} XAF</span></div></div><div className="mx-5 mb-5 grid gap-2 border-t pt-4 sm:grid-cols-[1fr_auto] sm:items-end"><label className="text-xs font-semibold">Order status<select value={nextStatus} onChange={(event) => setNextStatus(event.target.value)} className="mt-1.5 h-10 w-full border border-neutral-300 bg-white px-3 text-xs">{orderStatuses.map((item) => <option key={item} value={item}>{label(item)}</option>)}</select></label><button disabled={saving || nextStatus === selected.status} onClick={() => void updateStatus()} className="h-10 bg-[#d48100] px-5 text-xs font-bold text-white disabled:opacity-50">{saving ? 'Saving…' : 'Save Status'}</button>{actionError && <p role="alert" className="text-xs text-red-700 sm:col-span-2">{actionError}</p>}</div></section></div>}
    {showWalkIn && <AdminWalkInOrderDialog onClose={() => setShowWalkIn(false)} onCreated={() => void loadOrders(1)} />}
  </div>;
}
