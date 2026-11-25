'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, CircleDollarSign, Clock3, CreditCard, Eye, Filter, Search, X } from 'lucide-react';
import { adminService } from '../services/admin.service';
import { AdminPage, AdminRecord } from '../types/admin.types';

type Payment = AdminRecord & {
  id: string; status: string; amount: number | string; created_at: string;
  transaction_reference?: string | null;
  payment_method?: { name?: string } | null;
  order?: {
    id?: string; order_number?: string; status?: string; guest_name?: string | null; guest_email?: string | null;
    customer?: { first_name?: string; last_name?: string; user?: { email?: string } } | null;
  } | null;
};
type Summary = { totalPayments: number; totalAmount: number; successfulPayments: number; pendingPayments: number; failedPayments: number; changes: Record<string, number | null> };
const PAGE_SIZE = 5;
const paymentMethods = ['MTN Mobile Money', 'Orange Money', 'Bank Card', 'Cash Before Delivery'];
const defaultSummary: Summary = { totalPayments: 0, totalAmount: 0, successfulPayments: 0, pendingPayments: 0, failedPayments: 0, changes: {} };
const dateInput = (value: Date) => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
const money = (value: unknown) => Number(value ?? 0).toLocaleString('en-US', { maximumFractionDigits: 0 });
const customerName = (payment: Payment) => [payment.order?.customer?.first_name, payment.order?.customer?.last_name].filter(Boolean).join(' ') || payment.order?.guest_name || 'Guest Customer';
const paymentStatus = (status?: string) => status?.toUpperCase() === 'PAID' ? 'Successful' : (status ?? 'Unknown').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
const statusClass = (status?: string) => status?.toUpperCase() === 'PAID' ? 'bg-green-50 text-green-700' : status?.toUpperCase() === 'PENDING' ? 'bg-amber-50 text-amber-700' : status?.toUpperCase() === 'FAILED' || status?.toUpperCase() === 'CANCELLED' ? 'bg-red-50 text-red-700' : 'bg-neutral-100 text-neutral-600';
const methodShort = (method?: string) => method?.includes('MTN') ? { label: 'MTN', className: 'bg-yellow-100 text-yellow-900' } : method?.includes('Orange') ? { label: 'OM', className: 'bg-orange-100 text-orange-800' } : method?.includes('Card') ? { label: 'CARD', className: 'bg-blue-100 text-blue-800' } : { label: 'CASH', className: 'bg-green-100 text-green-800' };

function csvExport(rows: Payment[]) {
  const quote = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const headings = ['Payment ID', 'Order Number', 'Customer', 'Email', 'Method', 'Amount (XAF)', 'Status', 'Date', 'Transaction Reference'];
  const lines = [headings.map(quote).join(','), ...rows.map((payment) => [payment.id, payment.order?.order_number, customerName(payment), payment.order?.customer?.user?.email ?? payment.order?.guest_email, payment.payment_method?.name, payment.amount, paymentStatus(payment.status), payment.created_at, payment.transaction_reference].map(quote).join(','))];
  const url = URL.createObjectURL(new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'maillot-store-payments.csv'; anchor.click(); URL.revokeObjectURL(url);
}

export function AdminPaymentsPage() {
  const [data, setData] = useState<AdminPage<AdminRecord>>({ items: [], total: 0, page: 1, limit: PAGE_SIZE });
  const [summary, setSummary] = useState<Summary>(defaultSummary);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [method, setMethod] = useState('');
  const [startDate, setStartDate] = useState(() => { const date = new Date(); date.setDate(date.getDate() - 7); return dateInput(date); });
  const [endDate, setEndDate] = useState(() => dateInput(new Date()));
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Payment | null>(null);
  const [nextStatus, setNextStatus] = useState('');
  const [transactionReference, setTransactionReference] = useState('');
  const [verified, setVerified] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async (targetPage = 1) => {
    setLoading(true); setError('');
    try {
      const result = await adminService.getPaymentsPage({ page: targetPage, limit: PAGE_SIZE, search: search.trim(), status: status || undefined, paymentMethod: method || undefined, startDate: startDate ? `${startDate}T00:00:00.000Z` : undefined, endDate: endDate ? `${endDate}T23:59:59.999Z` : undefined });
      setData(result); setSummary(result.summary); setPage(targetPage);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not load payments.'); }
    finally { setLoading(false); }
  }, [search, status, method, startDate, endDate]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(1), search ? 250 : 0);
    return () => window.clearTimeout(timer);
  }, [load, search]);

  const payments = data.items as Payment[];
  const pages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));
  const pageNumbers = useMemo(() => [...new Set([1, Math.max(1, page - 1), page, Math.min(pages, page + 1), pages])].sort((a, b) => a - b), [page, pages]);
  const filters = { search: search.trim(), status: status || undefined, paymentMethod: method || undefined, startDate: startDate ? `${startDate}T00:00:00.000Z` : undefined, endDate: endDate ? `${endDate}T23:59:59.999Z` : undefined };

  const exportPayments = async () => {
    setExporting(true); setError('');
    try {
      const first = await adminService.getPaymentsPage({ ...filters, page: 1, limit: 100 });
      const all = [...first.items] as Payment[];
      for (let next = 2; next <= Math.ceil(first.total / 100); next += 1) {
        const result = await adminService.getPaymentsPage({ ...filters, page: next, limit: 100 });
        all.push(...result.items as Payment[]);
      }
      csvExport(all);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not export payments.'); }
    finally { setExporting(false); }
  };

  const updateStatus = async () => {
    if (!selected) return;
    if (nextStatus === 'PAID' && !verified) { setActionError('Verify receipt of funds before marking this payment successful.'); return; }
    setSaving(true); setActionError('');
    try {
      await adminService.updatePaymentStatus(selected.id, nextStatus, transactionReference.trim() || undefined);
      setSelected(null); await load(page);
    } catch (cause) { setActionError(cause instanceof Error ? cause.message : 'Could not update this payment.'); }
    finally { setSaving(false); }
  };

  const changeFilter = (setter: (value: string) => void) => (event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => { setter(event.target.value); setPage(1); };
  const delta = (key: string) => summary.changes?.[key];

  const cards = [
    { label: 'Total Payments', value: summary.totalPayments, change: delta('totalPayments'), icon: CircleDollarSign, positive: true },
    { label: 'Total Amount (XAF)', value: money(summary.totalAmount), change: delta('totalAmount'), icon: CreditCard, positive: true },
    { label: 'Successful Payments', value: summary.successfulPayments, change: delta('successfulPayments'), icon: CircleDollarSign, positive: true },
    { label: 'Pending Payments', value: summary.pendingPayments, change: delta('pendingPayments'), icon: Clock3, positive: false },
    { label: 'Failed Payments', value: summary.failedPayments, change: delta('failedPayments'), icon: X, positive: false },
  ];

  return <div className="mx-auto max-w-[1400px] text-neutral-950">
    <div className="mb-5 flex items-start justify-between gap-4"><div><h1 className="text-2xl font-black">Payments</h1><p className="mt-1 text-xs text-neutral-600">View and manage all payments in the system.</p></div><button onClick={() => void exportPayments()} disabled={exporting} className="h-9 rounded border border-neutral-300 bg-white px-5 text-[11px] font-semibold hover:border-[#d28a00] disabled:opacity-50">{exporting ? 'Exporting…' : 'Export'}</button></div>

    <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{cards.map(({ label, value, change: percent, icon: Icon, positive }) => <article key={label} className="min-h-[110px] border border-neutral-200 bg-white p-3 shadow-sm"><div className="flex items-center gap-2"><span className={`grid h-8 w-8 place-items-center rounded-full ${positive ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}><Icon size={16}/></span><span className="text-[10px] font-medium text-neutral-600">{label}</span></div><p className="mt-2 text-xl font-black">{value}</p><p className={`mt-1 text-[9px] font-semibold ${percent === null || percent === undefined ? 'text-neutral-400' : percent >= 0 ? 'text-green-700' : 'text-red-600'}`}>{percent === null || percent === undefined ? '—' : `${percent >= 0 ? '+' : ''}${percent}%`} <span className="font-normal text-neutral-500">vs last 7 days</span></p></article>)}</div>

    <section className="overflow-hidden border border-neutral-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-3 border-b border-neutral-100 p-4"><label className="flex h-9 min-w-[220px] flex-1 items-center gap-2 rounded border border-neutral-200 px-3 sm:max-w-[300px]"><Search size={15} className="text-neutral-400"/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search payments…" className="w-full text-xs outline-none"/></label><select aria-label="Filter payment method" value={method} onChange={changeFilter(setMethod)} className="h-9 min-w-40 rounded border border-neutral-200 bg-white px-3 text-xs"><option value="">All Payment Methods</option>{paymentMethods.map((item) => <option key={item} value={item}>{item}</option>)}</select><select aria-label="Filter payment status" value={status} onChange={changeFilter(setStatus)} className="h-9 min-w-36 rounded border border-neutral-200 bg-white px-3 text-xs"><option value="">All Status</option><option value="PAID">Successful</option><option value="PENDING">Pending</option><option value="FAILED">Failed</option><option value="CANCELLED">Cancelled</option></select><label className="flex h-9 items-center gap-2 rounded border border-neutral-200 px-2 text-[10px] text-neutral-500"><CalendarDays size={14}/><input aria-label="Start date" type="date" value={startDate} onChange={changeFilter(setStartDate)} className="w-[108px] text-[10px] outline-none"/><span>–</span><input aria-label="End date" type="date" value={endDate} onChange={changeFilter(setEndDate)} className="w-[108px] text-[10px] outline-none"/></label><button onClick={() => void load(1)} className="inline-flex h-9 items-center gap-2 rounded border border-neutral-300 px-4 text-xs font-semibold hover:border-[#d28a00]"><Filter size={14}/>Filter</button></div>

      {error ? <div role="alert" className="p-8 text-center text-sm text-red-700">{error}<button onClick={() => void load(page)} className="ml-2 underline">Retry</button></div> : loading ? <div className="p-10 text-center text-xs text-neutral-500">Loading payments…</div> : payments.length ? <div className="overflow-x-auto"><table className="w-full min-w-[930px] text-left text-[10px]"><thead className="bg-neutral-50 text-neutral-600"><tr>{['Payment ID', 'Order #', 'Customer', 'Method', 'Amount (XAF)', 'Status', 'Date', 'Actions'].map((title) => <th key={title} className="border-b border-neutral-200 px-3 py-3 font-semibold">{title}</th>)}</tr></thead><tbody className="divide-y divide-neutral-100">{payments.map((payment) => { const methodBadge = methodShort(payment.payment_method?.name); return <tr key={payment.id} className="hover:bg-neutral-50"><td className="whitespace-nowrap px-3 py-3 font-medium">{payment.id.slice(0, 18)}</td><td className="whitespace-nowrap px-3 py-3">{payment.order?.order_number ? `#${payment.order.order_number}` : '—'}</td><td className="px-3 py-3 font-medium">{customerName(payment)}</td><td className="px-3 py-3"><span className={`mr-1.5 rounded px-1.5 py-1 text-[9px] font-bold ${methodBadge.className}`}>{methodBadge.label}</span>{payment.payment_method?.name ?? '—'}</td><td className="whitespace-nowrap px-3 py-3">{money(payment.amount)}</td><td className="px-3 py-3"><span className={`rounded px-2 py-1 font-semibold ${statusClass(payment.status)}`}>{paymentStatus(payment.status)}</span></td><td className="whitespace-nowrap px-3 py-3">{new Date(payment.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td><td className="px-3 py-3"><button aria-label={`View payment ${payment.id}`} onClick={() => { setSelected(payment); setNextStatus(payment.status); setTransactionReference(payment.transaction_reference ?? ''); setVerified(false); setActionError(''); }} className="grid h-8 w-8 place-items-center rounded border border-neutral-200 text-neutral-600 hover:border-[#d28a00]"><Eye size={14}/></button></td></tr>; })}</tbody></table></div> : <div className="p-10 text-center text-xs text-neutral-500">No payments match these filters.</div>}

      {!error && !loading && <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 px-4 py-3 text-xs text-neutral-500"><span>Showing {data.total ? (page - 1) * PAGE_SIZE + 1 : 0} to {Math.min(page * PAGE_SIZE, data.total)} of {data.total} payments</span><div className="flex items-center gap-1"><button aria-label="Previous page" disabled={page <= 1} onClick={() => void load(page - 1)} className="grid h-8 w-8 place-items-center rounded border border-neutral-200 disabled:opacity-40"><ChevronLeft size={15}/></button>{pageNumbers.map((pageNumber, index) => <span key={pageNumber} className="flex items-center gap-1">{index > 0 && pageNumber - pageNumbers[index - 1] > 1 && <span className="px-1">…</span>}<button onClick={() => void load(pageNumber)} aria-current={page === pageNumber ? 'page' : undefined} className={`grid h-8 min-w-8 place-items-center rounded border px-2 ${page === pageNumber ? 'border-[#bf7900] bg-[#d48100] font-bold text-white' : 'border-neutral-200 hover:border-[#d28a00]'}`}>{pageNumber}</button></span>)}<button aria-label="Next page" disabled={page >= pages} onClick={() => void load(page + 1)} className="grid h-8 w-8 place-items-center rounded border border-neutral-200 disabled:opacity-40"><ChevronRight size={15}/></button></div></footer>}
    </section>

    {selected && <div role="dialog" aria-modal="true" aria-labelledby="payment-detail-title" className="fixed inset-0 z-[60] grid place-items-center bg-black/50 p-4"><section className="max-h-[90vh] w-full max-w-xl overflow-y-auto border border-neutral-200 bg-white shadow-xl"><header className="flex items-center justify-between border-b px-5 py-4"><div><p className="text-[10px] font-semibold uppercase tracking-widest text-[#966800]">Payment details</p><h2 id="payment-detail-title" className="mt-1 text-base font-bold">{selected.id}</h2></div><button aria-label="Close" onClick={() => setSelected(null)}><X size={18}/></button></header><div className="grid gap-3 p-5 sm:grid-cols-2"><p className="border p-3 text-xs"><span className="mb-1 block text-[10px] text-neutral-500">Order</span>{selected.order?.order_number ?? '—'}</p><p className="border p-3 text-xs"><span className="mb-1 block text-[10px] text-neutral-500">Customer</span>{customerName(selected)}</p><p className="border p-3 text-xs"><span className="mb-1 block text-[10px] text-neutral-500">Email</span>{selected.order?.customer?.user?.email ?? selected.order?.guest_email ?? '—'}</p><p className="border p-3 text-xs"><span className="mb-1 block text-[10px] text-neutral-500">Amount</span>{money(selected.amount)} XAF</p><p className="border p-3 text-xs"><span className="mb-1 block text-[10px] text-neutral-500">Method</span>{selected.payment_method?.name ?? '—'}</p><p className="border p-3 text-xs"><span className="mb-1 block text-[10px] text-neutral-500">Date</span>{new Date(selected.created_at).toLocaleString()}</p></div><div className="space-y-3 px-5 pb-5"><label className="block text-xs font-semibold">Payment status<select value={nextStatus} onChange={(event) => { setNextStatus(event.target.value); if (event.target.value !== 'PAID') setVerified(false); }} className="mt-1.5 h-10 w-full border border-neutral-300 bg-white px-3 text-xs">{['PENDING', 'PAID', 'FAILED', 'CANCELLED'].map((item) => <option key={item} value={item}>{paymentStatus(item)}</option>)}</select></label>{nextStatus === 'PAID' && <label className="flex items-start gap-2 text-xs text-neutral-700"><input type="checkbox" checked={verified} onChange={(event) => setVerified(event.target.checked)}/><span>I verified receipt of this payment through the business&apos;s actual payment process.</span></label>}<label className="block text-xs font-semibold">Transaction reference (optional)<input value={transactionReference} onChange={(event) => setTransactionReference(event.target.value)} maxLength={100} className="mt-1.5 h-10 w-full border border-neutral-300 px-3 text-xs"/></label>{actionError && <p role="alert" className="text-xs text-red-700">{actionError}</p>}<div className="flex justify-end"><button disabled={saving || nextStatus === selected.status || (nextStatus === 'PAID' && !verified)} onClick={() => void updateStatus()} className="h-10 bg-[#d48100] px-5 text-xs font-bold text-white disabled:opacity-50">{saving ? 'Saving…' : 'Save payment'}</button></div></div></section></div>}
  </div>;
}
