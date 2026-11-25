'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Eye, Filter, MoreHorizontal, Pencil, Search, X } from 'lucide-react';
import { AdminPage, AdminRecord } from '../types/admin.types';
import { adminService } from '../services/admin.service';

type Customer = AdminRecord & {
  id: string; first_name: string; last_name: string; phone?: string | null;
  registration_source?: string; status?: string; total_spent?: number | string;
  created_at?: string; _count?: { orders?: number };
  user?: { id?: string; email?: string; created_at?: string; deleted_at?: string | null };
};
type CustomerDetails = Customer & { addresses?: Array<{ id: string; address: string; city: string; region?: string | null; country: string; is_default: boolean }>; orders?: Array<{ id: string; order_number: string; status: string; total_amount: number | string; created_at: string; payment?: { status: string } | null }> };
const PAGE_SIZE = 5;
const money = (value: unknown) => Number(value ?? 0).toLocaleString('en-US', { maximumFractionDigits: 0 });
const fullName = (customer: Customer) => `${customer.first_name ?? ''} ${customer.last_name ?? ''}`.trim() || 'Customer';

function downloadCsv(rows: Customer[]) {
  const quote = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const headers = ['Customer', 'Email', 'Phone', 'Total Orders', 'Total Spent (XAF)', 'Status', 'Registration Source', 'Joined'];
  const lines = [headers.map(quote).join(','), ...rows.map((row) => [fullName(row), row.user?.email, row.phone, row._count?.orders, row.total_spent, row.status, row.registration_source, row.created_at].map(quote).join(','))];
  const url = URL.createObjectURL(new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = 'maillot-store-customers.csv'; link.click(); URL.revokeObjectURL(url);
}

export function AdminCustomersPage() {
  const [data, setData] = useState<AdminPage<AdminRecord>>({ items: [], total: 0, page: 1, limit: PAGE_SIZE });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [source, setSource] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<CustomerDetails | null>(null);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');
  const [menuId, setMenuId] = useState('');
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async (targetPage = 1) => {
    setLoading(true); setError('');
    try {
      const result = await adminService.getCustomersPage({ page: targetPage, limit: PAGE_SIZE, search: search.trim(), status: status || undefined, registrationSource: source || undefined });
      setData(result); setPage(targetPage);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not load customers.'); }
    finally { setLoading(false); }
  }, [search, status, source]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(1), search ? 250 : 0);
    return () => window.clearTimeout(timer);
  }, [load, search]);

  const customers = data.items as Customer[];
  const pageCount = Math.max(1, Math.ceil(data.total / PAGE_SIZE));
  const pageButtons = useMemo(() => [...new Set([1, Math.max(1, page - 1), page, Math.min(pageCount, page + 1), pageCount])].sort((a, b) => a - b), [page, pageCount]);

  const openCustomer = async (customer: Customer, edit = false) => {
    setMenuId(''); setActionError(''); setEditing(edit);
    setEditForm({ firstName: customer.first_name, lastName: customer.last_name, email: customer.user?.email ?? '', phone: customer.phone ?? '' });
    setSelected({ ...customer });
    try { setSelected(await adminService.getCustomer(customer.id) as CustomerDetails); }
    catch (cause) { setActionError(cause instanceof Error ? cause.message : 'Could not load customer details.'); }
  };

  const saveCustomer = async () => {
    if (!selected) return;
    setSaving(true); setActionError('');
    try {
      await adminService.updateCustomer(selected.id, { firstName: editForm.firstName.trim(), lastName: editForm.lastName.trim(), email: editForm.email.trim(), phone: editForm.phone.trim() || undefined });
      setEditing(false); await load(page); await openCustomer({ ...selected, first_name: editForm.firstName, last_name: editForm.lastName, phone: editForm.phone, user: { ...selected.user, email: editForm.email } });
    } catch (cause) { setActionError(cause instanceof Error ? cause.message : 'Could not update this customer.'); }
    finally { setSaving(false); }
  };

  const setActive = async (customer: Customer) => {
    const active = customer.status !== 'ACTIVE';
    setMenuId(''); setError('');
    try { await adminService.updateCustomerStatus(customer.id, active); await load(page); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not update customer status.'); }
  };

  const exportCustomers = async () => {
    setExporting(true); setError('');
    try {
      const first = await adminService.getCustomersPage({ page: 1, limit: 100, search: search.trim(), status: status || undefined, registrationSource: source || undefined });
      const all = [...first.items] as Customer[];
      for (let next = 2; next <= Math.ceil(first.total / 100); next += 1) {
        const result = await adminService.getCustomersPage({ page: next, limit: 100, search: search.trim(), status: status || undefined, registrationSource: source || undefined });
        all.push(...result.items as Customer[]);
      }
      downloadCsv(all);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not export customers.'); }
    finally { setExporting(false); }
  };

  return <div className="mx-auto max-w-[1400px] text-neutral-950">
    <div className="mb-5 flex items-start justify-between gap-4"><div><h2 className="text-2xl font-black">Customers</h2><p className="mt-1 text-xs text-neutral-600">View and manage registered customers.</p></div><button onClick={() => void exportCustomers()} disabled={exporting} className="h-9 rounded border border-neutral-300 bg-white px-5 text-[11px] font-semibold hover:border-[#d28a00] disabled:opacity-50">{exporting ? 'Exporting…' : 'Export'}</button></div>
    <section className="overflow-visible rounded border border-neutral-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-3 border-b border-neutral-100 p-4"><label className="flex h-10 min-w-[220px] flex-1 items-center gap-2 rounded border border-neutral-200 px-3 sm:max-w-[360px]"><Search size={15} className="text-neutral-400"/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search customers…" className="w-full text-xs outline-none"/></label><select aria-label="Filter customer status" value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 min-w-40 rounded border border-neutral-200 bg-white px-3 text-xs"><option value="">All Status</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select><select aria-label="Filter registration source" value={source} onChange={(event) => setSource(event.target.value)} className="h-10 min-w-52 rounded border border-neutral-200 bg-white px-3 text-xs"><option value="">All Registration Sources</option><option value="WEBSITE">Website</option><option value="ADMIN">Admin</option><option value="UNKNOWN">Unknown</option></select><button onClick={() => void load(1)} className="inline-flex h-10 items-center gap-2 rounded border border-neutral-300 px-4 text-xs font-semibold hover:border-[#d28a00]"><Filter size={14}/>Filter</button></div>
      {error ? <div role="alert" className="p-8 text-center text-sm text-red-700">{error}<button onClick={() => void load(page)} className="ml-2 underline">Retry</button></div> : loading ? <div className="p-10 text-center text-xs text-neutral-500">Loading customers…</div> : customers.length ? <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-[11px]"><thead className="bg-neutral-50 text-neutral-600"><tr>{['Customer', 'Email', 'Phone', 'Total Orders', 'Total Spent (XAF)', 'Status', 'Actions'].map((title) => <th key={title} className="border-b border-neutral-200 px-4 py-3 font-semibold">{title}</th>)}</tr></thead><tbody className="divide-y divide-neutral-100">{customers.map((customer) => <tr key={customer.id} className="hover:bg-neutral-50"><td className="px-4 py-3"><div className="flex items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-neutral-900 text-xs font-bold text-white">{`${customer.first_name?.[0] ?? ''}${customer.last_name?.[0] ?? ''}`.toUpperCase()}</span><span className="font-semibold">{fullName(customer)}</span></div></td><td className="px-4 py-3">{customer.user?.email ?? '—'}</td><td className="px-4 py-3">{customer.phone ?? '—'}</td><td className="px-4 py-3 text-center">{customer._count?.orders ?? 0}</td><td className="px-4 py-3">{money(customer.total_spent)}</td><td className="px-4 py-3"><span className={`rounded px-2 py-1 text-[10px] font-semibold ${customer.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{customer.status === 'ACTIVE' ? 'Active' : 'Inactive'}</span></td><td className="px-4 py-3"><div className="relative flex items-center gap-2"><button aria-label={`Edit ${fullName(customer)}`} onClick={() => void openCustomer(customer, true)} className="grid h-8 w-8 place-items-center rounded border border-neutral-200 text-neutral-600 hover:border-[#d28a00]"><Pencil size={14}/></button><button aria-label={`More actions for ${fullName(customer)}`} onClick={() => setMenuId(menuId === customer.id ? '' : customer.id)} className="grid h-8 w-8 place-items-center rounded border border-neutral-200 text-neutral-600 hover:border-[#d28a00]"><MoreHorizontal size={16}/></button>{menuId === customer.id && <div className="absolute right-0 top-9 z-20 min-w-40 border border-neutral-200 bg-white py-1 shadow-lg"><button onClick={() => void openCustomer(customer)} className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-neutral-50"><Eye size={14}/>View details</button><button onClick={() => void setActive(customer)} className="w-full px-3 py-2 text-left text-xs hover:bg-neutral-50">{customer.status === 'ACTIVE' ? 'Deactivate customer' : 'Activate customer'}</button></div>}</div></td></tr>)}</tbody></table></div> : <div className="p-10 text-center text-xs text-neutral-500">No customers match these filters.</div>}
      {!error && !loading && <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 px-4 py-3 text-xs text-neutral-500"><span>Showing {data.total ? (page - 1) * PAGE_SIZE + 1 : 0} to {Math.min(page * PAGE_SIZE, data.total)} of {data.total} customers</span><div className="flex items-center gap-1"><button aria-label="Previous page" disabled={page <= 1} onClick={() => void load(page - 1)} className="grid h-8 w-8 place-items-center rounded border border-neutral-200 disabled:opacity-40"><ChevronLeft size={15}/></button>{pageButtons.map((pageNumber, index) => <span key={pageNumber} className="flex items-center gap-1">{index > 0 && pageNumber - pageButtons[index - 1] > 1 && <span className="px-1">…</span>}<button onClick={() => void load(pageNumber)} className={`grid h-8 min-w-8 place-items-center rounded border px-2 ${page === pageNumber ? 'border-[#c87900] bg-[#d48100] font-bold text-white' : 'border-neutral-200 hover:border-[#d28a00]'}`}>{pageNumber}</button></span>)}<button aria-label="Next page" disabled={page >= pageCount} onClick={() => void load(page + 1)} className="grid h-8 w-8 place-items-center rounded border border-neutral-200 disabled:opacity-40"><ChevronRight size={15}/></button></div></footer>}
    </section>

    {selected && <div role="dialog" aria-modal="true" aria-labelledby="customer-detail-title" className="fixed inset-0 z-[60] grid place-items-center bg-black/50 p-4"><section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-neutral-200 bg-white shadow-xl"><header className="flex items-center justify-between border-b px-5 py-4"><div><p className="text-[10px] font-semibold uppercase tracking-widest text-[#966800]">Customer</p><h2 id="customer-detail-title" className="mt-1 text-base font-bold">{editing ? 'Edit customer' : fullName(selected)}</h2></div><button aria-label="Close" onClick={() => { setSelected(null); setEditing(false); }}><X size={18}/></button></header>
      {editing ? <div className="grid gap-4 p-5 sm:grid-cols-2"><label className="text-xs font-semibold">First name<input value={editForm.firstName} onChange={(event) => setEditForm({ ...editForm, firstName: event.target.value })} className="mt-1 block h-10 w-full border border-neutral-300 px-3"/></label><label className="text-xs font-semibold">Last name<input value={editForm.lastName} onChange={(event) => setEditForm({ ...editForm, lastName: event.target.value })} className="mt-1 block h-10 w-full border border-neutral-300 px-3"/></label><label className="text-xs font-semibold">Email<input type="email" value={editForm.email} onChange={(event) => setEditForm({ ...editForm, email: event.target.value })} className="mt-1 block h-10 w-full border border-neutral-300 px-3"/></label><label className="text-xs font-semibold">Phone<input value={editForm.phone} onChange={(event) => setEditForm({ ...editForm, phone: event.target.value })} className="mt-1 block h-10 w-full border border-neutral-300 px-3"/></label></div> : <div className="space-y-5 p-5"><div className="grid gap-3 sm:grid-cols-2"><p className="border p-3 text-xs"><span className="mb-1 block text-[10px] text-neutral-500">Email</span>{selected.user?.email ?? '—'}</p><p className="border p-3 text-xs"><span className="mb-1 block text-[10px] text-neutral-500">Phone</span>{selected.phone ?? '—'}</p><p className="border p-3 text-xs"><span className="mb-1 block text-[10px] text-neutral-500">Registration source</span>{selected.registration_source ?? 'Website'}</p><p className="border p-3 text-xs"><span className="mb-1 block text-[10px] text-neutral-500">Joined</span>{selected.user?.created_at ? new Date(selected.user.created_at).toLocaleDateString() : '—'}</p></div><section><h3 className="mb-2 text-sm font-bold">Addresses</h3>{selected.addresses?.length ? <div className="divide-y border-y">{selected.addresses.map((address) => <p key={address.id} className="py-2 text-xs">{address.address}, {address.city}{address.region ? `, ${address.region}` : ''}, {address.country}{address.is_default ? ' · Default' : ''}</p>)}</div> : <p className="text-xs text-neutral-500">No saved addresses.</p>}</section><section><h3 className="mb-2 text-sm font-bold">Recent orders</h3>{selected.orders?.length ? <div className="divide-y border-y">{selected.orders.map((order) => <div key={order.id} className="flex justify-between gap-3 py-2 text-xs"><span>#{order.order_number} · {order.status}</span><span>{money(order.total_amount)} XAF</span></div>)}</div> : <p className="text-xs text-neutral-500">No orders yet.</p>}</section></div>}
      {actionError && <p role="alert" className="px-5 pb-2 text-xs text-red-700">{actionError}</p>}<footer className="flex justify-end gap-2 border-t px-5 py-4">{editing && <><button onClick={() => setEditing(false)} className="h-10 border border-neutral-300 px-4 text-xs font-semibold">Cancel</button><button disabled={saving || !editForm.firstName.trim() || !editForm.lastName.trim() || !editForm.email.trim()} onClick={() => void saveCustomer()} className="h-10 bg-[#d48100] px-5 text-xs font-bold text-white disabled:opacity-50">{saving ? 'Saving…' : 'Save changes'}</button></>}</footer>
    </section></div>}
  </div>;
}
