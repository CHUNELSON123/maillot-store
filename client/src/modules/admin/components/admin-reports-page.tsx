'use client';

import { useEffect, useState } from 'react';
import { adminService } from '../services/admin.service';
import { AdminRecord } from '../types/admin.types';

const tabs = [
  { label: 'Sales Overview', key: 'sales' },
  { label: 'Inventory', key: 'inventory' },
  { label: 'Customers', key: 'customers' },
  { label: 'Commissions', key: 'commissions' },
];

export function AdminReportsPage() {
  const [tab, setTab] = useState('sales');
  const [data, setData] = useState<AdminRecord | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  useEffect(() => {
    setLoading(true); setError('');
    adminService.getReports(tab, startDate || undefined, endDate || undefined).then(setData).catch((cause) => setError(cause instanceof Error ? cause.message : 'Could not load report.')).finally(() => setLoading(false));
  }, [tab, startDate, endDate]);
  const entries = data ? Object.entries(data).filter(([, value]) => value === null || ['string', 'number', 'boolean'].includes(typeof value)) : [];
  return <div className="mx-auto max-w-[1500px] space-y-5"><div><p className="text-xs text-neutral-500">Administration / Reports & Analytics</p><h1 className="mt-1 text-2xl font-black">Reports & Analytics</h1><p className="mt-1 text-sm text-neutral-600">Report values are calculated from current persisted business records.</p></div>
    <nav className="flex flex-wrap gap-2 border-b border-neutral-200">{tabs.map((item) => <button key={item.key} onClick={() => setTab(item.key)} className={`border-b-2 px-4 py-3 text-xs font-semibold ${tab === item.key ? 'border-[#D4AF37] text-[#8b6100]' : 'border-transparent text-neutral-500'}`}>{item.label}</button>)}</nav>
    {(tab === 'sales' || tab === 'commissions') && <div className="flex flex-wrap items-end gap-3 border border-neutral-200 bg-white p-4"><label className="text-xs font-semibold">From<input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="mt-1 block border border-neutral-300 px-3 py-2 font-normal"/></label><label className="text-xs font-semibold">To<input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="mt-1 block border border-neutral-300 px-3 py-2 font-normal"/></label><button onClick={() => { setStartDate(''); setEndDate(''); }} className="border border-neutral-300 px-3 py-2 text-xs font-semibold">Clear dates</button></div>}
    {error && <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
    {loading ? <div className="border border-neutral-200 bg-white p-10 text-center text-sm text-neutral-500">Loading report…</div> : entries.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{entries.map(([key, value]) => <article key={key} className="border border-neutral-200 bg-white p-5"><p className="text-xs capitalize text-neutral-500">{key.replace(/[A-Z]/g, (letter) => ` ${letter}`).replaceAll('_', ' ')}</p><strong className="mt-3 block text-2xl font-black">{typeof value === 'number' ? value.toLocaleString() : String(value ?? '—')}</strong></article>)}</div> : !error && <div className="border border-neutral-200 bg-white p-10 text-center text-sm text-neutral-500">No report values are available.</div>}
    <p className="text-xs text-neutral-500">Charts are omitted until the reporting API provides time-series or category breakdown data; no sample series are shown.</p>
  </div>;
}
