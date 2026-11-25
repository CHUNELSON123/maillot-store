'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, Eye, Filter, MapPin, PackageCheck, Search, Truck, X } from 'lucide-react';
import { AdminPage, AdminRecord } from '../types/admin.types';
import { adminService } from '../services/admin.service';

type Delivery = AdminRecord & {
  id: string; order_id: string; delivery_status: string; address: string;
  tracking_number?: string | null; provider?: string | null; created_at: string; delivered_at?: string | null;
  order?: { id?: string; order_number?: string; guest_name?: string | null; guest_email?: string | null; delivery_address?: string | null; delivery_city?: string | null; delivery_postal_code?: string | null; customer?: { first_name?: string; last_name?: string } | null } | null;
};
type Summary = { totalDeliveries: number; inTransit: number; delivered: number; pending: number; failed: number; changes: Record<string, number | null> };
const PAGE_SIZE = 5;
const statuses = ['PENDING', 'ASSIGNED', 'IN_TRANSIT', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'CANCELLED'];
const dateInput = (value: Date) => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
const fullName = (delivery: Delivery) => [delivery.order?.customer?.first_name, delivery.order?.customer?.last_name].filter(Boolean).join(' ') || delivery.order?.guest_name || 'Guest Customer';
const statusLabel = (value?: string) => {
  switch (value?.toUpperCase()) {
    case 'PROCESSING': case 'SHIPPED': case 'OUT_FOR_DELIVERY': case 'IN_TRANSIT': return 'In Transit';
    case 'DELIVERED': return 'Delivered';
    case 'PENDING': return 'Pending';
    case 'ASSIGNED': return 'Assigned';
    case 'FAILED': return 'Failed';
    case 'CANCELLED': return 'Cancelled';
    default: return value ?? 'Unknown';
  }
};
const statusClass = (value?: string) => {
  const status = value?.toUpperCase();
  return status === 'DELIVERED' ? 'bg-green-50 text-green-700' : ['PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'IN_TRANSIT'].includes(status ?? '') ? 'bg-blue-50 text-blue-700' : status === 'FAILED' || status === 'CANCELLED' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700';
};
const csv = (rows: Delivery[]) => {
  const quote = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const header = ['Delivery ID', 'Order Number', 'Customer', 'Delivery Partner', 'Status', 'Tracking Number', 'Address', 'Date'];
  const lines = [header.map(quote).join(','), ...rows.map((row) => [row.id, row.order?.order_number, fullName(row), row.provider, statusLabel(row.delivery_status), row.tracking_number, row.address, row.created_at].map(quote).join(','))];
  const url = URL.createObjectURL(new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = 'maillot-store-deliveries.csv'; link.click(); URL.revokeObjectURL(url);
};

export function AdminDeliveriesPage() {
  const [data, setData] = useState<AdminPage<AdminRecord>>({ items: [], total: 0, page: 1, limit: PAGE_SIZE });
  const [summary, setSummary] = useState<Summary>({ totalDeliveries: 0, inTransit: 0, delivered: 0, pending: 0, failed: 0, changes: {} });
  const [partners, setPartners] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [provider, setProvider] = useState('');
  const [startDate, setStartDate] = useState(() => { const date = new Date(); date.setDate(date.getDate() - 7); return dateInput(date); });
  const [endDate, setEndDate] = useState(() => dateInput(new Date()));
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Delivery | null>(null);
  const [nextStatus, setNextStatus] = useState('');
  const [nextProvider, setNextProvider] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async (targetPage = 1) => {
    setLoading(true); setError('');
    try {
      const result = await adminService.getDeliveriesPage({ page: targetPage, limit: PAGE_SIZE, search: search.trim(), status: status || undefined, provider: provider || undefined, startDate: startDate ? `${startDate}T00:00:00.000Z` : undefined, endDate: endDate ? `${endDate}T23:59:59.999Z` : undefined });
      setData(result); setSummary(result.summary); setPartners(result.partners); setPage(targetPage);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not load deliveries.'); }
    finally { setLoading(false); }
  }, [search, status, provider, startDate, endDate]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(1), search ? 250 : 0);
    return () => window.clearTimeout(timer);
  }, [load, search]);

  const deliveries = data.items as Delivery[];
  const pages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));
  const pageNumbers = useMemo(() => [...new Set([1, Math.max(1, page - 1), page, Math.min(pages, page + 1), pages])].sort((a, b) => a - b), [page, pages]);
  const filters = { search: search.trim(), status: status || undefined, provider: provider || undefined, startDate: startDate ? `${startDate}T00:00:00.000Z` : undefined, endDate: endDate ? `${endDate}T23:59:59.999Z` : undefined };

  const exportDeliveries = async () => {
    setExporting(true); setError('');
    try {
      const first = await adminService.getDeliveriesPage({ ...filters, page: 1, limit: 100 });
      const all = [...first.items] as Delivery[];
      for (let next = 2; next <= Math.ceil(first.total / 100); next += 1) {
        const result = await adminService.getDeliveriesPage({ ...filters, page: next, limit: 100 });
        all.push(...result.items as Delivery[]);
      }
      csv(all);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not export deliveries.'); }
    finally { setExporting(false); }
  };

  const openDetails = (delivery: Delivery) => {
    setSelected(delivery); setNextStatus(delivery.delivery_status); setNextProvider(delivery.provider ?? '');
    setTrackingNumber(delivery.tracking_number ?? ''); setAddress(delivery.address ?? ''); setActionError('');
  };
  const saveDelivery = async () => {
    if (!selected) return;
    setSaving(true); setActionError('');
    try {
      await adminService.updateDelivery(selected.id, { deliveryStatus: nextStatus, provider: nextProvider.trim() || undefined, trackingNumber: trackingNumber.trim() || undefined, address: address.trim() || undefined });
      setSelected(null); await load(page);
    } catch (cause) { setActionError(cause instanceof Error ? cause.message : 'Could not update delivery.'); }
    finally { setSaving(false); }
  };

  const changeFilter = (setter: (value: string) => void) => (event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => { setter(event.target.value); setPage(1); };
  const cards = [
    { label: 'Total Deliveries', value: summary.totalDeliveries, change: summary.changes.totalDeliveries, icon: Truck, color: 'bg-blue-50 text-blue-700' },
    { label: 'In Transit', value: summary.inTransit, change: summary.changes.inTransit, icon: MapPin, color: 'bg-blue-50 text-blue-700' },
    { label: 'Delivered', value: summary.delivered, change: summary.changes.delivered, icon: PackageCheck, color: 'bg-teal-50 text-teal-700' },
    { label: 'Pending', value: summary.pending, change: summary.changes.pending, icon: Clock3, color: 'bg-orange-50 text-orange-700' },
    { label: 'Failed', value: summary.failed, change: summary.changes.failed, icon: X, color: 'bg-red-50 text-red-700' },
  ];

  return <div className="mx-auto max-w-[1400px] text-neutral-950">
    <div className="mb-5 flex items-start justify-between gap-4"><div><h1 className="text-2xl font-black">Deliveries</h1><p className="mt-1 text-xs text-neutral-600">Track and manage all order deliveries.</p></div><button onClick={() => void exportDeliveries()} disabled={exporting} className="h-9 rounded border border-neutral-300 bg-white px-5 text-[11px] font-semibold hover:border-[#d28a00] disabled:opacity-50">{exporting ? 'Exporting…' : 'Export'}</button></div>

    <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{cards.map(({ label, value, change, icon: Icon, color }) => <article key={label} className="min-h-[110px] border border-neutral-200 bg-white p-3 shadow-sm"><div className="flex items-center gap-2"><span className={`grid h-8 w-8 place-items-center rounded-full ${color}`}><Icon size={16}/></span><span className="text-[10px] font-medium text-neutral-600">{label}</span></div><p className="mt-2 text-xl font-black">{value.toLocaleString()}</p><p className={`mt-1 text-[9px] font-semibold ${change === null || change === undefined ? 'text-neutral-400' : change >= 0 ? 'text-green-700' : 'text-red-600'}`}>{change === null || change === undefined ? '—' : `${change >= 0 ? '+' : ''}${change}%`} <span className="font-normal text-neutral-500">vs last 7 days</span></p></article>)}</div>

    <section className="overflow-hidden border border-neutral-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-3 border-b border-neutral-100 p-4"><label className="flex h-9 min-w-[200px] flex-1 items-center gap-2 rounded border border-neutral-200 px-3 sm:max-w-[280px]"><Search size={15} className="text-neutral-400"/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search deliveries…" className="w-full text-xs outline-none"/></label><select aria-label="Filter delivery status" value={status} onChange={changeFilter(setStatus)} className="h-9 min-w-36 rounded border border-neutral-200 bg-white px-3 text-xs"><option value="">All Status</option><option value="PENDING">Pending</option><option value="ASSIGNED">Assigned</option><option value="IN_TRANSIT">In Transit</option><option value="DELIVERED">Delivered</option><option value="FAILED">Failed</option><option value="CANCELLED">Cancelled</option></select><select aria-label="Filter delivery partner" value={provider} onChange={changeFilter(setProvider)} className="h-9 min-w-40 rounded border border-neutral-200 bg-white px-3 text-xs"><option value="">All Delivery Partners</option>{partners.map((partner) => <option key={partner} value={partner}>{partner}</option>)}</select><label className="flex h-9 items-center gap-2 rounded border border-neutral-200 px-2 text-[10px] text-neutral-500"><CalendarDays size={14}/><input aria-label="Start date" type="date" value={startDate} onChange={changeFilter(setStartDate)} className="w-[108px] text-[10px] outline-none"/><span>–</span><input aria-label="End date" type="date" value={endDate} onChange={changeFilter(setEndDate)} className="w-[108px] text-[10px] outline-none"/></label><button onClick={() => void load(1)} className="inline-flex h-9 items-center gap-2 rounded border border-neutral-300 px-4 text-xs font-semibold hover:border-[#d28a00]"><Filter size={14}/>Filter</button></div>

      {error ? <div role="alert" className="p-8 text-center text-sm text-red-700">{error}<button onClick={() => void load(page)} className="ml-2 underline">Retry</button></div> : loading ? <div className="p-10 text-center text-xs text-neutral-500">Loading deliveries…</div> : deliveries.length ? <div className="overflow-x-auto"><table className="w-full min-w-[950px] text-left text-[10px]"><thead className="bg-neutral-50 text-neutral-600"><tr>{['Delivery ID', 'Order #', 'Customer', 'Delivery Partner', 'Status', 'Tracking #', 'Date', 'Actions'].map((heading) => <th key={heading} className="border-b border-neutral-200 px-3 py-3 font-semibold">{heading}</th>)}</tr></thead><tbody className="divide-y divide-neutral-100">{deliveries.map((delivery) => <tr key={delivery.id} className="hover:bg-neutral-50"><td title={delivery.id} className="whitespace-nowrap px-3 py-3 font-medium">{delivery.id.slice(0, 12).toUpperCase()}</td><td className="whitespace-nowrap px-3 py-3">{delivery.order?.order_number ? `#${delivery.order.order_number}` : '—'}</td><td className="px-3 py-3 font-medium">{fullName(delivery)}</td><td className="px-3 py-3">{delivery.provider || '—'}</td><td className="px-3 py-3"><span className={`rounded px-2 py-1 font-semibold ${statusClass(delivery.delivery_status)}`}>{statusLabel(delivery.delivery_status)}</span></td><td className="whitespace-nowrap px-3 py-3">{delivery.tracking_number || '—'}</td><td className="whitespace-nowrap px-3 py-3">{new Date(delivery.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td><td className="px-3 py-3"><button aria-label={`View delivery ${delivery.id}`} onClick={() => openDetails(delivery)} className="grid h-8 w-8 place-items-center rounded border border-neutral-200 text-neutral-600 hover:border-[#d28a00]"><Eye size={14}/></button></td></tr>)}</tbody></table></div> : <div className="p-10 text-center text-xs text-neutral-500">No deliveries match these filters.</div>}

      {!error && !loading && <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 px-4 py-3 text-xs text-neutral-500"><span>Showing {data.total ? (page - 1) * PAGE_SIZE + 1 : 0} to {Math.min(page * PAGE_SIZE, data.total)} of {data.total} deliveries</span><div className="flex items-center gap-1"><button aria-label="Previous page" disabled={page <= 1} onClick={() => void load(page - 1)} className="grid h-8 w-8 place-items-center rounded border border-neutral-200 disabled:opacity-40"><ChevronLeft size={15}/></button>{pageNumbers.map((pageNumber, index) => <span key={pageNumber} className="flex items-center gap-1">{index > 0 && pageNumber - pageNumbers[index - 1] > 1 && <span className="px-1">…</span>}<button onClick={() => void load(pageNumber)} aria-current={page === pageNumber ? 'page' : undefined} className={`grid h-8 min-w-8 place-items-center rounded border px-2 ${page === pageNumber ? 'border-[#bf7900] bg-[#d48100] font-bold text-white' : 'border-neutral-200 hover:border-[#d28a00]'}`}>{pageNumber}</button></span>)}<button aria-label="Next page" disabled={page >= pages} onClick={() => void load(page + 1)} className="grid h-8 w-8 place-items-center rounded border border-neutral-200 disabled:opacity-40"><ChevronRight size={15}/></button></div></footer>}
    </section>

    {selected && <div role="dialog" aria-modal="true" aria-labelledby="delivery-detail-title" className="fixed inset-0 z-[60] grid place-items-center bg-black/50 p-4"><section className="max-h-[90vh] w-full max-w-xl overflow-y-auto border border-neutral-200 bg-white shadow-xl"><header className="flex items-center justify-between border-b px-5 py-4"><div><p className="text-[10px] font-semibold uppercase tracking-widest text-[#966800]">Delivery details</p><h2 id="delivery-detail-title" className="mt-1 text-base font-bold">{selected.order?.order_number ? `#${selected.order.order_number}` : selected.id}</h2></div><button aria-label="Close" onClick={() => setSelected(null)}><X size={18}/></button></header><div className="grid gap-3 p-5 sm:grid-cols-2"><p className="border p-3 text-xs"><span className="mb-1 block text-[10px] text-neutral-500">Customer</span>{fullName(selected)}</p><p className="border p-3 text-xs"><span className="mb-1 block text-[10px] text-neutral-500">Created</span>{new Date(selected.created_at).toLocaleString()}</p><p className="border p-3 text-xs sm:col-span-2"><span className="mb-1 block text-[10px] text-neutral-500">Order address</span>{[selected.order?.delivery_address, selected.order?.delivery_city, selected.order?.delivery_postal_code].filter(Boolean).join(', ') || selected.address}</p></div><div className="space-y-3 px-5 pb-5"><label className="block text-xs font-semibold">Delivery status<select value={nextStatus} onChange={(event) => setNextStatus(event.target.value)} className="mt-1.5 h-10 w-full border border-neutral-300 bg-white px-3 text-xs">{statuses.map((item) => <option key={item} value={item}>{statusLabel(item)}</option>)}</select></label><label className="block text-xs font-semibold">Delivery partner<input value={nextProvider} onChange={(event) => setNextProvider(event.target.value)} maxLength={100} className="mt-1.5 h-10 w-full border border-neutral-300 px-3 text-xs"/></label><label className="block text-xs font-semibold">Tracking number<input value={trackingNumber} onChange={(event) => setTrackingNumber(event.target.value)} maxLength={100} className="mt-1.5 h-10 w-full border border-neutral-300 px-3 text-xs"/></label><label className="block text-xs font-semibold">Delivery address<input value={address} onChange={(event) => setAddress(event.target.value)} maxLength={255} className="mt-1.5 h-10 w-full border border-neutral-300 px-3 text-xs"/></label>{actionError && <p role="alert" className="text-xs text-red-700">{actionError}</p>}<div className="flex justify-end"><button disabled={saving || (nextStatus === selected.delivery_status && nextProvider === (selected.provider ?? '') && trackingNumber === (selected.tracking_number ?? '') && address === selected.address)} onClick={() => void saveDelivery()} className="h-10 bg-[#d48100] px-5 text-xs font-bold text-white disabled:opacity-50">{saving ? 'Saving…' : 'Save delivery'}</button></div></div></section></div>}
  </div>;
}
