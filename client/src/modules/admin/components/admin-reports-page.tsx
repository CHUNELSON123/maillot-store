'use client';

import { useEffect, useMemo, useState } from 'react';
import { adminService } from '../services/admin.service';
import { AdminRecord, AdminDashboardSummary } from '../types/admin.types';

type Point = { label: string; value: number };
type SalesReport = {
  totalOrders: number; confirmedOrders: number; cancelledOrders: number; totalSales: number;
  revenueOverTime: Point[]; ordersOverTime: Point[];
  topProducts: Array<{ id: string; name: string; quantity: number; revenue: number }>;
  salesBySource: Array<{ source: string; orders: number; revenue: number }>;
};
type ReportTab = 'sales' | 'revenue' | 'products' | 'customers' | 'influencers' | 'inventory';

const tabs: Array<{ label: string; key: ReportTab }> = [
  { label: 'Sales Overview', key: 'sales' }, { label: 'Revenue', key: 'revenue' },
  { label: 'Products', key: 'products' }, { label: 'Customers', key: 'customers' },
  { label: 'Influencers', key: 'influencers' }, { label: 'Inventory', key: 'inventory' },
];
const cardClass = 'rounded-lg border border-slate-200 bg-white';
const money = (value: number) => `${Math.round(value).toLocaleString()} XAF`;
const number = (value: unknown) => typeof value === 'number' && Number.isFinite(value) ? value : 0;
const labelSource = (source: string) => source.toLowerCase().replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

function LineChart({ points, color, currency = false }: { points: Point[]; color: string; currency?: boolean }) {
  const width = 620; const height = 190; const left = 42; const right = 12; const top = 14; const bottom = 30;
  const max = Math.max(1, ...points.map((point) => point.value));
  const usableWidth = width - left - right; const usableHeight = height - top - bottom;
  const coords = points.map((point, index) => ({
    x: points.length < 2 ? left + usableWidth / 2 : left + (index / (points.length - 1)) * usableWidth,
    y: top + usableHeight - (point.value / max) * usableHeight,
    point,
  }));
  const visibleLabels = coords.filter((_, index) => index === 0 || index === coords.length - 1 || (coords.length <= 8 ? true : index % Math.ceil(coords.length / 6) === 0));
  return <div className="w-full overflow-hidden">
    <svg viewBox={`0 0 ${width} ${height}`} className="h-[220px] w-full" role="img" aria-label={currency ? 'Revenue over time' : 'Orders over time'}>
      {[0, 1, 2, 3].map((line) => { const y = top + (usableHeight / 3) * line; return <g key={line}><line x1={left} x2={width - right} y1={y} y2={y} stroke="#e8edf3"/><text x={left - 8} y={y + 4} textAnchor="end" fill="#94a3b8" fontSize="10">{currency ? `${Math.round(max * (1 - line / 3) / 1000)}k` : Math.round(max * (1 - line / 3))}</text></g>; })}
      {coords.length > 1 && <polyline fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={coords.map(({ x, y }) => `${x},${y}`).join(' ')} />}
      {coords.map(({ x, y, point }, index) => <circle key={`${point.label}-${index}`} cx={x} cy={y} r="3.5" fill={color}><title>{point.label}: {currency ? money(point.value) : point.value.toLocaleString()}</title></circle>)}
      {visibleLabels.map(({ x, point }, index) => <text key={`${point.label}-${index}`} x={x} y={height - 7} textAnchor="middle" fill="#64748b" fontSize="9">{point.label}</text>)}
    </svg>
  </div>;
}

function Donut({ rows }: { rows: SalesReport['salesBySource'] }) {
  const colors = ['#2563eb', '#d97706', '#111827', '#94a3b8', '#16a34a'];
  const total = rows.reduce((sum, row) => sum + row.revenue, 0);
  let progress = 0;
  const gradient = rows.map((row, index) => {
    const start = progress; progress += total ? row.revenue / total * 100 : 0;
    return `${colors[index % colors.length]} ${start}% ${progress}%`;
  }).join(', ');
  return <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-center">
    <div className="relative h-36 w-36 shrink-0 rounded-full" style={{ background: total ? `conic-gradient(${gradient})` : '#e2e8f0' }} aria-label={`Sales source distribution, ${money(total)} total`}>
      <div className="absolute inset-[23px] flex items-center justify-center rounded-full bg-white text-center"><span className="text-[10px] text-slate-500">Total sales<strong className="mt-1 block text-xs text-slate-900">{money(total)}</strong></span></div>
    </div>
    <div className="w-full space-y-3">{rows.map((row, index) => <div key={row.source} className="flex items-center justify-between gap-3 text-xs"><span className="flex items-center gap-2 text-slate-600"><i className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors[index % colors.length] }}/>{labelSource(row.source)}</span><strong className="whitespace-nowrap text-slate-800">{total ? Math.round(row.revenue / total * 100) : 0}% <span className="font-normal text-slate-500">({money(row.revenue)})</span></strong></div>)}{!rows.length && <p className="text-xs text-slate-500">No sales by source for this period.</p>}</div>
  </div>;
}

export function AdminReportsPage() {
  const today = new Date(); const weekAgo = new Date(today); weekAgo.setDate(today.getDate() - 6);
  const [tab, setTab] = useState<ReportTab>('sales');
  const [startDate, setStartDate] = useState(weekAgo.toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(today.toISOString().slice(0, 10));
  const [sales, setSales] = useState<SalesReport | null>(null);
  const [report, setReport] = useState<AdminRecord | null>(null);
  const [dashboard, setDashboard] = useState<AdminDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true); const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    const path = tab === 'influencers' ? 'commissions' : tab === 'products' || tab === 'revenue' || tab === 'sales' ? 'sales' : tab;
    const requests: Promise<unknown>[] = [adminService.getReports(path, startDate || undefined, endDate || undefined)];
    if (tab === 'sales') requests.push(adminService.getDashboard(startDate || undefined, endDate || undefined));
    Promise.all(requests).then(([result, summary]) => {
      if (!active) return;
      if (path === 'sales') setSales(result as SalesReport); else setReport(result as AdminRecord);
      if (summary) setDashboard(summary as AdminDashboardSummary);
    }).catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : 'Could not load report.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [tab, startDate, endDate]);

  const metrics = useMemo(() => {
    if (tab === 'sales' || tab === 'revenue') return [
      { label: 'Total Revenue (XAF)', value: money(number(sales?.totalSales)), color: 'text-amber-600' },
      { label: 'Total Orders', value: number(sales?.totalOrders).toLocaleString(), color: 'text-slate-900' },
      { label: 'Total Customers', value: number(dashboard?.totalCustomers).toLocaleString(), color: 'text-blue-600' },
      { label: 'Average Order Value', value: money(sales?.confirmedOrders ? number(sales.totalSales) / sales.confirmedOrders : 0), color: 'text-emerald-600' },
    ];
    const fields: Record<Exclude<ReportTab, 'sales' | 'revenue' | 'products'>, Array<[string, string]>> = {
      customers: [['Total Customers', 'totalCustomers'], ['Active Customers', 'activeCustomers'], ['Customers With Orders', 'customersWithOrders']],
      influencers: [['Total Commissions (XAF)', 'totalCommissions'], ['Pending (XAF)', 'pendingAmount'], ['Approved (XAF)', 'approvedAmount'], ['Paid (XAF)', 'paidAmount']],
      inventory: [['Total Variants', 'totalVariants'], ['Total Quantity', 'totalQuantity'], ['Low Stock', 'lowStockCount'], ['Out Of Stock', 'outOfStockCount']],
    };
    return (fields[tab as keyof typeof fields] ?? []).map(([label, key]) => ({ label, value: Number(report?.[key] ?? 0).toLocaleString(), color: 'text-slate-900' }));
  }, [tab, sales, dashboard, report]);

  const productRows = sales?.topProducts ?? [];
  return <div className="mx-auto max-w-[1500px] space-y-5">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-2xl font-bold text-slate-900">Reports &amp; Analytics</h1><p className="mt-1 text-sm text-slate-600">View detailed reports and analytics.</p></div>
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-2"><label className="sr-only" htmlFor="report-start">Start date</label><input id="report-start" type="date" value={startDate} max={endDate || undefined} onChange={(event) => setStartDate(event.target.value)} className="rounded-md px-2 py-1.5 text-xs text-slate-700 outline-none"/><span className="text-xs text-slate-400">–</span><label className="sr-only" htmlFor="report-end">End date</label><input id="report-end" type="date" value={endDate} min={startDate || undefined} onChange={(event) => setEndDate(event.target.value)} className="rounded-md px-2 py-1.5 text-xs text-slate-700 outline-none"/></div>
    </div>
    <nav className="flex gap-5 overflow-x-auto border-b border-slate-200">{tabs.map((item) => <button key={item.key} onClick={() => setTab(item.key)} className={`shrink-0 border-b-2 px-1 py-3 text-xs font-semibold ${tab === item.key ? 'border-amber-600 text-amber-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>{item.label}</button>)}</nav>
    {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
    {loading ? <div className={`${cardClass} p-12 text-center text-sm text-slate-500`}>Loading report…</div> : <>
      {metrics.length > 0 && <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map((metric) => <article key={metric.label} className={`${cardClass} p-4`}><p className="text-xs text-slate-500">{metric.label}</p><strong className={`mt-3 block text-xl font-bold ${metric.color}`}>{metric.value}</strong></article>)}</div>}
      {(tab === 'sales' || tab === 'revenue') && <div className="grid gap-4 xl:grid-cols-2">
        <section className={`${cardClass} p-4`}><h2 className="text-sm font-semibold text-slate-800">Revenue Over Time (XAF)</h2><LineChart points={sales?.revenueOverTime ?? []} color="#ed8b00" currency/></section>
        <section className={`${cardClass} p-4`}><h2 className="text-sm font-semibold text-slate-800">Orders Over Time</h2><LineChart points={sales?.ordersOverTime ?? []} color="#171717"/></section>
      </div>}
      {(tab === 'sales' || tab === 'products') && <div className="grid gap-4 xl:grid-cols-2">
        <section className={`${cardClass} p-4`}><h2 className="mb-4 text-sm font-semibold text-slate-800">Top Selling Products</h2>{productRows.length ? <div className="divide-y divide-slate-100">{productRows.map((product, index) => <div key={product.id} className="flex items-center justify-between gap-3 py-3 text-xs"><span className="flex min-w-0 items-center gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-500">{index + 1}</span><span className="truncate font-medium text-slate-700">{product.name}</span></span><span className="whitespace-nowrap text-right text-slate-500">{product.quantity} sold <strong className="ml-2 text-slate-800">{money(product.revenue)}</strong></span></div>)}</div> : <p className="py-8 text-center text-xs text-slate-500">No product sales in this period.</p>}</section>
        {tab === 'sales' && <section className={`${cardClass} p-4`}><h2 className="mb-5 text-sm font-semibold text-slate-800">Sales by Source</h2><Donut rows={sales?.salesBySource ?? []}/></section>}
      </div>}
      {tab !== 'sales' && tab !== 'revenue' && tab !== 'products' && <div className={`${cardClass} p-6 text-sm text-slate-500`}>Report values reflect records currently stored in the system.</div>}
    </>}
  </div>;
}
