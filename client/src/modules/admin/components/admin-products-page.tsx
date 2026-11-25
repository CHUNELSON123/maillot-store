'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { Download, MoreHorizontal, Pencil, Plus, Search, SlidersHorizontal } from 'lucide-react';
import { adminService } from '../services/admin.service';
import { AdminRecord } from '../types/admin.types';
import { AdminCreateRecordDialog } from './admin-create-record-dialog';

type ProductRow = AdminRecord & { categoryName: string; brandName: string; sku: string; stock: number; imageUrl: string | null };
const money = new Intl.NumberFormat('fr-CM', { maximumFractionDigits: 0 });
const text = (value: unknown) => value === null || value === undefined ? '' : String(value);
function imageUrl(value: unknown) {
  const url = text(value);
  if (!url || url.startsWith('http') || !url.startsWith('/uploads')) return url || null;
  try { return `${new URL(process.env.NEXT_PUBLIC_API_URL ?? '').origin}${url}`; } catch { return url; }
}

export function AdminProductsPage() {
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<AdminRecord[]>([]);
  const [brands, setBrands] = useState<AdminRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [status, setStatus] = useState('');
  const [applied, setApplied] = useState({ search: '', categoryId: '', brandId: '', status: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<ProductRow | null>(null);
  const loadOptions = useCallback(async () => {
    try {
      const [nextCategories, nextBrands] = await Promise.all([adminService.getCategories(), adminService.getBrands()]);
      setCategories(nextCategories); setBrands(nextBrands);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not load categories and brands.'); }
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const result = await adminService.getProductPage({ page, ...applied });
      const hydrated = await Promise.all(result.items.map(async (product) => {
        const [productImages, productVariants] = await Promise.all([
          adminService.getProductImages(text(product.id)), adminService.getProductVariants(text(product.id)),
        ]);
        const inventories = await Promise.all(productVariants.map((item) => adminService.getInventory(text(item.id)).catch(() => null)));
        const category = categories.find((item) => text(item.id) === text(product.categoryId));
        const brand = brands.find((item) => text(item.id) === text(product.brandId));
        return {
          ...product,
          categoryName: text(category?.name) || '—',
          brandName: text(brand?.name) || '—',
          sku: productVariants.map((item) => text(item.sku)).filter(Boolean).join(', ') || '—',
          stock: inventories.reduce((sum, inventory) => sum + Number(inventory?.quantity ?? 0), 0),
          imageUrl: imageUrl(productImages.find((item) => item.isPrimary)?.imageUrl ?? productImages[0]?.imageUrl),
        };
      }));
      setRows(hydrated); setTotal(result.total);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not load products.'); }
    finally { setLoading(false); }
  }, [page, applied, categories, brands]);

  useEffect(() => { void loadOptions(); }, [loadOptions]);
  useEffect(() => { void loadProducts(); }, [loadProducts]);

  const applyFilters = () => { setApplied({ search, categoryId, brandId, status }); setPage(1); };
  const pageCount = Math.max(1, Math.ceil(total / 5));
  const openProduct = (product: ProductRow) => setSelected(product);
  const exportVisible = () => {
    const csv = [['Product', 'SKU', 'Category', 'Brand', 'Price (XAF)', 'Stock', 'Status'], ...rows.map((item) => [text(item.name), item.sku, item.categoryName, item.brandName, text(item.price), String(item.stock), text(item.status)])]
      .map((line) => line.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(',')).join('\r\n');
    const href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a'); anchor.href = href; anchor.download = `products-page-${page}.csv`; anchor.click(); URL.revokeObjectURL(href);
  };

  return <div className="mx-auto max-w-[1500px] space-y-5">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs text-neutral-500">Administration / Products</p><h1 className="mt-1 text-2xl font-black">Products</h1><p className="mt-1 text-sm text-neutral-600">Add, edit and manage the products shown in your store.</p></div><div className="flex gap-2"><button type="button" onClick={exportVisible} disabled={!rows.length} className="inline-flex h-10 items-center gap-2 border border-neutral-300 bg-white px-4 text-xs font-semibold disabled:opacity-50"><Download size={14}/>Export</button><button type="button" onClick={() => setCreating(true)} className="inline-flex h-10 items-center gap-2 bg-[#D4AF37] px-4 text-xs font-bold text-black"><Plus size={15}/>Add New Product</button></div></div>
    <section className="border border-neutral-200 bg-white shadow-sm">
      <div className="grid gap-2 border-b border-neutral-100 p-4 lg:grid-cols-[minmax(190px,1.5fr)_repeat(3,minmax(140px,1fr))_auto]">
        <label className="flex h-10 items-center gap-2 border border-neutral-200 px-3"><Search size={15} className="text-neutral-400"/><input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && applyFilters()} placeholder="Search products…" className="min-w-0 flex-1 text-xs outline-none"/></label>
        <select aria-label="Filter by category" value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="h-10 border border-neutral-200 bg-white px-3 text-xs"><option value="">All Categories</option>{categories.map((item) => <option key={text(item.id)} value={text(item.id)}>{text(item.name)}</option>)}</select>
        <select aria-label="Filter by brand" value={brandId} onChange={(event) => setBrandId(event.target.value)} className="h-10 border border-neutral-200 bg-white px-3 text-xs"><option value="">All Brands</option>{brands.map((item) => <option key={text(item.id)} value={text(item.id)}>{text(item.name)}</option>)}</select>
        <select aria-label="Filter by status" value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 border border-neutral-200 bg-white px-3 text-xs"><option value="">All Status</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select>
        <button type="button" onClick={applyFilters} className="inline-flex h-10 items-center justify-center gap-2 border border-neutral-300 px-4 text-xs font-semibold"><SlidersHorizontal size={14}/>Filter</button>
      </div>
      {error ? <div role="alert" className="p-8 text-sm text-red-700">{error}</div> : loading ? <div className="p-10 text-center text-sm text-neutral-500">Loading products…</div> : !rows.length ? <div className="p-10 text-center text-sm text-neutral-500">No products match these filters.</div> : <div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left text-xs"><thead className="bg-neutral-50 text-[10px] uppercase text-neutral-600"><tr>{['Product', 'SKU', 'Category', 'Brand', 'Price (XAF)', 'Stock', 'Status', 'Actions'].map((label) => <th key={label} className="px-3 py-3 font-semibold">{label}</th>)}</tr></thead><tbody className="divide-y divide-neutral-100">{rows.map((item) => <tr key={text(item.id)} className="hover:bg-neutral-50"><td className="px-3 py-2.5"><div className="flex min-w-0 items-center gap-3"><span className="relative h-11 w-11 shrink-0 overflow-hidden rounded border border-neutral-100 bg-neutral-50">{item.imageUrl && <Image src={item.imageUrl} alt="" fill sizes="44px" unoptimized className="object-contain p-1"/>}</span><span className="max-w-[230px] truncate font-semibold">{text(item.name)}</span></div></td><td className="max-w-[150px] truncate px-3 py-2.5 text-neutral-600" title={item.sku}>{item.sku}</td><td className="px-3 py-2.5">{item.categoryName}</td><td className="px-3 py-2.5">{item.brandName}</td><td className="px-3 py-2.5">{money.format(Number(item.price))}</td><td className={`px-3 py-2.5 font-semibold ${item.stock <= 5 ? 'text-orange-700' : ''}`}>{item.stock}</td><td className="px-3 py-2.5"><span className={`rounded px-2 py-1 text-[10px] font-semibold ${text(item.status) === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-neutral-100 text-neutral-700'}`}>{text(item.status) === 'ACTIVE' ? 'Active' : 'Inactive'}</span></td><td className="px-3 py-2.5"><div className="flex gap-1"><button aria-label={`Edit ${text(item.name)}`} onClick={() => void openProduct(item)} className="grid h-8 w-8 place-items-center rounded border border-neutral-200 hover:border-[#D4AF37]"><Pencil size={14}/></button><button aria-label={`View ${text(item.name)} details`} onClick={() => void openProduct(item)} className="grid h-8 w-8 place-items-center rounded border border-neutral-200 hover:border-[#D4AF37]"><MoreHorizontal size={15}/></button></div></td></tr>)}</tbody></table></div>}
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 px-4 py-3 text-[11px] text-neutral-600"><span>Showing {total ? (page - 1) * 5 + 1 : 0} to {Math.min(page * 5, total)} of {total} products</span><nav aria-label="Product pages" className="flex items-center gap-1"><button disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="h-8 border border-neutral-200 px-3 disabled:opacity-40">‹</button>{Array.from({ length: Math.min(pageCount, 3) }, (_, index) => Math.max(1, Math.min(page - 1, pageCount - 2)) + index).map((value) => <button key={value} aria-current={page === value ? 'page' : undefined} onClick={() => setPage(value)} className={`h-8 min-w-8 border px-2 ${page === value ? 'border-[#b4830b] bg-[#D4AF37] font-bold text-black' : 'border-neutral-200'}`}>{value}</button>)}{pageCount > 3 && <><span className="px-1">…</span><button onClick={() => setPage(pageCount)} className={`h-8 min-w-8 border px-2 ${page === pageCount ? 'border-[#b4830b] bg-[#D4AF37] font-bold' : 'border-neutral-200'}`}>{pageCount}</button></>}<button disabled={page >= pageCount} onClick={() => setPage((current) => current + 1)} className="h-8 border border-neutral-200 px-3 disabled:opacity-40">›</button></nav></footer>
    </section>

    {creating && <AdminCreateRecordDialog section="products" onClose={() => setCreating(false)} onCreated={() => { setCreating(false); setPage(1); if (page === 1) void loadProducts(); }}/ >}
    {selected && <AdminCreateRecordDialog section="products" product={selected} onClose={() => setSelected(null)} onCreated={() => { setSelected(null); void loadProducts(); }} />}
  </div>;
}
