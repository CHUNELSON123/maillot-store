'use client';

import { Search } from 'lucide-react';
import { AdminRecord, AdminSection } from '../types/admin.types';
import { getRecordValue } from '../hooks/use-admin-section';

const columns: Partial<Record<AdminSection, [string, string][]>> = {
  products: [['Product', 'name'], ['Category', 'categoryId'], ['Brand', 'brandId'], ['Price (XAF)', 'price'], ['Status', 'status']],
  'categories-brands': [['Type', '_recordType'], ['Name', 'name'], ['Description', 'description'], ['Status', 'status']],
  inventory: [['Product', 'variant.product.name'], ['Variant / SKU', 'variant.sku'], ['Quantity', 'quantity'], ['Low stock level', 'min_stock'], ['Updated', 'updated_at']],
  orders: [['Order #', 'order_number'], ['Customer', 'customer.first_name'], ['Source', 'source'], ['Total (XAF)', 'total_amount'], ['Payment', 'payment.status'], ['Delivery', 'delivery.delivery_status'], ['Status', 'status']],
  customers: [['Customer', 'first_name'], ['Email', 'user.email'], ['Phone', 'phone'], ['Orders', '_count.orders'], ['Total spent (XAF)', 'total_spent'], ['Joined', 'created_at']],
  influencers: [['Influencer', 'profile.firstName'], ['Email', 'profile.email'], ['Referral code', 'referralCode'], ['Status', 'status'], ['Commission %', 'commissionRate']],
  payments: [['Payment ID', 'id'], ['Order #', 'order.order_number'], ['Method', 'payment_method.name'], ['Amount (XAF)', 'amount'], ['Status', 'status'], ['Created', 'created_at']],
  delivery: [['Delivery ID', 'id'], ['Order #', 'order.order_number'], ['Customer', 'order.customer.first_name'], ['Provider', 'provider'], ['Tracking #', 'tracking_number'], ['Status', 'delivery_status']],
  cms: [['Type', '_recordType'], ['Title', 'title'], ['Active', 'isActive'], ['Link / image', 'linkUrl'], ['Starts', 'startDate'], ['Ends', 'endDate']],
  users: [['Email', 'email'], ['Role', 'role.name'], ['Customer', 'customer.first_name'], ['Status', 'deleted_at'], ['Created', 'created_at']],
  settings: [['Setting', 'key'], ['Description', 'description'], ['Value', 'value'], ['Sensitive', 'isSensitive']],
};

function display(value: unknown) {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return Array.isArray(value) ? `${value.length} records` : '—';
  if (typeof value === 'string' && value.length > 24) return `${value.slice(0, 21)}…`;
  return String(value);
}

export function AdminDataTable({ section, items, total, page, limit, search, setSearch, onPage, onSelect, actionLabel = 'View', loading, error, emptyHint, status = '', onStatusChange }: {
  section: AdminSection; items: AdminRecord[]; total: number; page: number; limit: number;
  search: string; setSearch: (value: string) => void; onPage: (page: number) => void;
  onSelect?: (record: AdminRecord) => void; loading: boolean; error: string; emptyHint?: string;
  actionLabel?: string;
  status?: string;
  onStatusChange?: (value: string) => void;
}) {
  const fields = columns[section] ?? [];
  const pages = Math.max(1, Math.ceil(total / limit));
  const statusOptions = section === 'orders' ? ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] : section === 'payments' ? ['PENDING', 'PAID', 'FAILED', 'CANCELLED'] : section === 'delivery' ? ['PENDING', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'] : section === 'users' ? ['ACTIVE', 'INACTIVE'] : [];
  return <section className="border border-neutral-200 bg-white shadow-sm">
    <div className="flex flex-col gap-3 border-b border-neutral-100 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex flex-wrap gap-2"><label className="flex h-10 max-w-lg items-center gap-2 border border-neutral-200 px-3"><Search size={15} className="text-neutral-400"/><input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && onPage(1)} placeholder="Search records…" className="min-w-0 flex-1 text-sm outline-none"/></label>{statusOptions.length > 0 && onStatusChange && <select aria-label="Filter by status" value={status} onChange={(event) => onStatusChange(event.target.value)} className="h-10 border border-neutral-200 bg-white px-3 text-xs"><option value="">All Status</option>{statusOptions.map((option) => <option key={option}>{option}</option>)}</select>}</div><div className="text-xs text-neutral-500">{total.toLocaleString()} records</div></div>
    {error ? <div className="p-8 text-sm text-red-700">{error}</div> : loading ? <div className="p-10 text-center text-sm text-neutral-500">Loading persisted records…</div> : items.length === 0 ? <div className="p-10 text-center"><p className="text-sm font-medium text-neutral-700">No records found</p><p className="mt-1 text-xs text-neutral-500">{emptyHint ?? 'Records will appear here when they exist in the system.'}</p></div> : <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-xs"><thead className="bg-neutral-50 text-[10px] uppercase tracking-wide text-neutral-500"><tr>{fields.map(([label]) => <th key={label} className="whitespace-nowrap px-4 py-3 font-semibold">{label}</th>)}{onSelect && <th className="px-4 py-3">Actions</th>}</tr></thead><tbody className="divide-y divide-neutral-100">{items.map((record, index) => <tr key={String(record.id ?? `${record._recordType}-${index}`)} className="hover:bg-neutral-50">{fields.map(([label, path]) => { const value = getRecordValue(record, path); const isStatus = /status|active|sensitive/i.test(label); return <td key={path} className="max-w-[250px] px-4 py-3.5 text-neutral-700">{isStatus ? <span className="inline-flex rounded-full bg-neutral-100 px-2 py-1 text-[10px] font-semibold">{display(value)}</span> : display(value)}</td>; })}{onSelect && <td className="px-4 py-3"><button onClick={() => onSelect(record)} className="border border-neutral-300 px-3 py-1.5 font-semibold hover:border-[#D4AF37]">{actionLabel}</button></td>}</tr>)}</tbody></table></div>}
    <footer className="flex items-center justify-between border-t border-neutral-100 px-4 py-3 text-xs text-neutral-500"><span>Showing {total === 0 ? 0 : (page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}</span><div className="flex gap-2"><button disabled={page <= 1} onClick={() => onPage(page - 1)} className="border border-neutral-200 px-3 py-1.5 disabled:opacity-40">Previous</button><span className="px-2 py-1.5">{page} / {pages}</span><button disabled={page >= pages} onClick={() => onPage(page + 1)} className="border border-neutral-200 px-3 py-1.5 disabled:opacity-40">Next</button></div></footer>
  </section>;
}
