'use client';

import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Eye, FileUp, Filter, Search, X } from 'lucide-react';
import { adminService } from '../services/admin.service';
import { AdminPage, AdminRecord } from '../types/admin.types';
import { API_CONFIG } from '@/services/api/api-config';

type InventoryRow = AdminRecord & {
  id: string;
  variant_id: string;
  quantity: number;
  min_stock: number;
  variant?: {
    id?: string;
    sku?: string;
    size?: string | null;
    color?: string | null;
    edition?: string | null;
    product?: {
      id?: string;
      name?: string;
      images?: Array<{ image_url?: string; alt_text?: string | null }>;
      category?: { id?: string; name?: string };
      brand?: { id?: string; name?: string };
    };
  };
};

type MovementRow = AdminRecord & {
  id: string;
  quantity: number;
  movement_type: string;
  reference?: string | null;
  created_at: string;
  variant?: {
    sku?: string;
    size?: string | null;
    color?: string | null;
    edition?: string | null;
    product?: { name?: string; images?: Array<{ image_url?: string }> };
  };
};

type Tab = 'overview' | 'movements' | 'adjustments' | 'damage-loss';
type MovementType = 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT' | 'DAMAGE' | 'LOST';
const PAGE_SIZE = 5;
const apiOrigin = API_CONFIG.baseUrl.replace(/\/v1\/?$/, '');
const tabs: Array<{ id: Tab; label: string }> = [
  { id: 'overview', label: 'Stock Overview' },
  { id: 'movements', label: 'Stock Movements' },
  { id: 'adjustments', label: 'Adjustments' },
  { id: 'damage-loss', label: 'Damage / Loss' },
];

const number = (value: unknown) => Number(value ?? 0).toLocaleString('en-US');
const productName = (row: InventoryRow | MovementRow) => row.variant?.product?.name ?? 'Product';
const variantLabel = (row: InventoryRow | MovementRow) => {
  const variant = row.variant;
  if (!variant) return '—';
  return [variant.size && `Size: ${variant.size}`, variant.color && `Color: ${variant.color}`, variant.edition].filter(Boolean).join(' / ') || 'Standard';
};
const stockState = (row: InventoryRow) => row.quantity <= 0
  ? { label: 'Out of Stock', className: 'bg-red-50 text-red-700' }
  : row.quantity <= row.min_stock
    ? { label: 'Low Stock', className: 'bg-orange-50 text-orange-700' }
    : { label: 'In Stock', className: 'bg-green-50 text-green-700' };

function parseCsvRow(line: string) {
  const cells: string[] = [];
  let value = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"' && line[i + 1] === '"' && quoted) { value += '"'; i += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === ',' && !quoted) { cells.push(value.trim()); value = ''; }
    else value += char;
  }
  cells.push(value.trim());
  return cells;
}

function statusForMovement(type: string) {
  if (type === 'DAMAGE' || type === 'LOST') return 'text-red-700 bg-red-50';
  if (type === 'STOCK_IN') return 'text-green-700 bg-green-50';
  if (type === 'STOCK_OUT') return 'text-orange-700 bg-orange-50';
  return 'text-blue-700 bg-blue-50';
}

function movementAmount(row: MovementRow) {
  if (row.movement_type === 'STOCK_IN') return `+${number(row.quantity)}`;
  if (row.movement_type === 'ADJUSTMENT') return `${row.quantity > 0 ? '+' : ''}${number(row.quantity)}`;
  return `−${number(row.quantity)}`;
}

export function AdminInventoryPage() {
  const [tab, setTab] = useState<Tab>('overview');
  const [search, setSearch] = useState('');
  useEffect(() => {
    setSearch(new URLSearchParams(window.location.search).get('search') ?? '');
  }, []);
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [inventory, setInventory] = useState<AdminPage<AdminRecord>>({ items: [], total: 0, page: 1, limit: PAGE_SIZE });
  const [movements, setMovements] = useState<AdminPage<AdminRecord>>({ items: [], total: 0, page: 1, limit: PAGE_SIZE });
  const [summary, setSummary] = useState({ totalItems: 0, totalQuantity: 0, lowStockItems: 0, outOfStockItems: 0 });
  const [categories, setCategories] = useState<AdminRecord[]>([]);
  const [brands, setBrands] = useState<AdminRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [movementType, setMovementType] = useState<MovementType>('ADJUSTMENT');
  const [adjustmentOpen, setAdjustmentOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [selected, setSelected] = useState<InventoryRow | null>(null);
  const [selectedMovements, setSelectedMovements] = useState<AdminRecord[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [itemSearch, setItemSearch] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [allInventory, setAllInventory] = useState<InventoryRow[]>([]);
  const [variantId, setVariantId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [minStock, setMinStock] = useState('');
  const [reference, setReference] = useState('');
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [importRows, setImportRows] = useState<Array<{ sku: string; quantity: number; minStock?: number }>>([]);
  const [importName, setImportName] = useState('');

  const refreshSummary = useCallback(async () => {
    setSummary(await adminService.getInventorySummary());
  }, []);

  const refreshInventory = useCallback(async (targetPage = 1) => {
    setLoading(true);
    setError('');
    try {
      const result = await adminService.getInventoryPage({ page: targetPage, limit: PAGE_SIZE, search, categoryId, brandId, status: status || undefined });
      setInventory(result);
      setPage(targetPage);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load stock items.');
    } finally { setLoading(false); }
  }, [search, categoryId, brandId, status]);

  const refreshMovements = useCallback(async (targetPage = 1) => {
    setLoading(true);
    setError('');
    const filterType = tab === 'adjustments' ? 'ADJUSTMENT' : tab === 'damage-loss' ? 'DAMAGE_LOSS' : undefined;
    try {
      setMovements(await adminService.getInventoryMovementPage({ page: targetPage, limit: PAGE_SIZE, search, movementType: filterType }));
      setPage(targetPage);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load stock movements.');
    } finally { setLoading(false); }
  }, [search, tab]);

  useEffect(() => {
    void Promise.all([refreshSummary(), adminService.getCategories(), adminService.getBrands()])
      .then(([, nextCategories, nextBrands]) => { setCategories(nextCategories); setBrands(nextBrands); })
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'Could not load inventory filters.'));
  }, [refreshSummary]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (tab === 'overview') void refreshInventory(1);
      else void refreshMovements(1);
    }, search ? 250 : 0);
    return () => window.clearTimeout(timeout);
  }, [tab, search, categoryId, brandId, status, refreshInventory, refreshMovements]);

  useEffect(() => {
    if (!adjustmentOpen) return;
    let active = true;
    void adminService.getInventoryPage({ page: 1, limit: 100, search: itemSearch }).then((response) => { if (active) setAllInventory(response.items as InventoryRow[]); }).catch((cause) => { if (active) setActionError(cause instanceof Error ? cause.message : 'Could not load stock items.'); });
    return () => { active = false; };
  }, [adjustmentOpen, itemSearch]);

  const movementItems = movements.items as MovementRow[];
  const inventoryItems = inventory.items as InventoryRow[];
  const pageCount = (total: number) => Math.max(1, Math.ceil(total / PAGE_SIZE));
  const canPrevious = page > 1;
  const currentTotal = tab === 'overview' ? inventory.total : movements.total;
  const matchingInventory = useMemo(() => allInventory.filter((item) =>
    `${productName(item)} ${item.variant?.sku ?? ''}`.toLowerCase().includes(itemSearch.trim().toLowerCase()),
  ), [allInventory, itemSearch]);
  const visibleProducts = useMemo(() => {
    const products = new Map<string, { id: string; name: string }>();
    for (const item of matchingInventory) {
      const id = item.variant?.product?.id;
      if (id) products.set(id, { id, name: productName(item) });
    }
    return [...products.values()];
  }, [matchingInventory]);
  const visibleVariants = useMemo(() => matchingInventory.filter((item) =>
    selectedProductId && item.variant?.product?.id === selectedProductId,
  ), [matchingInventory, selectedProductId]);

  const openDetails = async (row: InventoryRow) => {
    setSelected(row);
    setDetailLoading(true);
    setSelectedMovements([]);
    try { setSelectedMovements(await adminService.getInventoryMovements(row.variant_id)); }
    catch (cause) { setActionError(cause instanceof Error ? cause.message : 'Could not load variant movement history.'); }
    finally { setDetailLoading(false); }
  };

  const openAdjustment = (row?: InventoryRow) => {
    setActionError(''); setActionMessage(''); setReference(''); setQuantity(''); setMinStock('');
    setVariantId(row?.variant_id ?? ''); setSelectedProductId(row?.variant?.product?.id ?? ''); setMovementType('ADJUSTMENT'); setItemSearch(row ? productName(row) : ''); setAdjustmentOpen(true);
  };

  const saveMovement = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = Number(quantity);
    const selectedItem = visibleVariants.find((item) => item.variant_id === variantId);
    if (!selectedItem) { setActionError('Select a product variant.'); return; }
    if (!Number.isSafeInteger(value) || value < 0 || (movementType !== 'ADJUSTMENT' && value === 0)) { setActionError(movementType === 'ADJUSTMENT' ? 'Enter a whole number for the new stock quantity.' : 'Enter a quantity greater than zero.'); return; }
    setSaving(true); setActionError('');
    try {
      await adminService.createInventoryMovement({ variantId, quantity: value, movementType, reference: reference.trim() || undefined });
      if (minStock.trim()) await adminService.updateInventory(variantId, { minStock: Number(minStock) });
      setAdjustmentOpen(false); setActionMessage('Stock change saved and recorded in inventory history.');
      await Promise.all([refreshSummary(), tab === 'overview' ? refreshInventory(page) : refreshMovements(page)]);
    } catch (cause) { setActionError(cause instanceof Error ? cause.message : 'Could not save this stock change.'); }
    finally { setSaving(false); }
  };

  const readImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setActionError(''); setActionMessage(''); setImportRows([]); setImportName(file.name);
    try {
      const lines = (await file.text()).split(/\r?\n/).filter((line) => line.trim());
      if (lines.length < 2) throw new Error('The CSV needs a header row and at least one stock row.');
      const headers = parseCsvRow(lines[0]).map((value) => value.toLowerCase().replace(/[ _-]/g, ''));
      const skuIndex = headers.findIndex((header) => ['sku', 'variantsku'].includes(header));
      const quantityIndex = headers.findIndex((header) => ['quantity', 'stockqty', 'currentstock'].includes(header));
      const thresholdIndex = headers.findIndex((header) => ['minstock', 'lowstockthreshold', 'threshold'].includes(header));
      if (skuIndex < 0 || quantityIndex < 0) throw new Error('CSV headers must include SKU and Quantity.');
      const rows = lines.slice(1).map((line, index) => {
        const cells = parseCsvRow(line);
        const sku = cells[skuIndex]?.trim();
        const quantity = Number(cells[quantityIndex]);
        const threshold = thresholdIndex >= 0 && cells[thresholdIndex] !== '' ? Number(cells[thresholdIndex]) : undefined;
        if (!sku || !Number.isSafeInteger(quantity) || quantity < 0 || (threshold !== undefined && (!Number.isSafeInteger(threshold) || threshold < 0))) throw new Error(`Invalid SKU, quantity, or threshold on CSV row ${index + 2}.`);
        return { sku, quantity, ...(threshold !== undefined ? { minStock: threshold } : {}) };
      });
      setImportRows(rows);
    } catch (cause) { setActionError(cause instanceof Error ? cause.message : 'Could not read this CSV file.'); }
    event.target.value = '';
  };

  const submitImport = async () => {
    if (!importRows.length) return;
    setSaving(true); setActionError('');
    try {
      const result = await adminService.importInventory(importRows);
      setImportOpen(false); setImportRows([]); setActionMessage(`${result.imported} stock rows imported successfully.`);
      await Promise.all([refreshSummary(), refreshInventory(1)]);
    } catch (cause) { setActionError(cause instanceof Error ? cause.message : 'Could not import stock.'); }
    finally { setSaving(false); }
  };

  const downloadTemplate = () => {
    const blob = new Blob(['SKU,Quantity,Low Stock Threshold\nRM-HJ-2425-M-WHT,28,10\n'], { type: 'text/csv;charset=utf-8' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = href; link.download = 'inventory-stock-template.csv'; link.click(); URL.revokeObjectURL(href);
  };

  const pagination = <div className="flex items-center justify-between gap-3 border-t border-neutral-100 px-4 py-3 text-xs text-neutral-500"><span>Showing {currentTotal ? (page - 1) * PAGE_SIZE + 1 : 0} to {Math.min(page * PAGE_SIZE, currentTotal)} of {number(currentTotal)} items</span><div className="flex items-center gap-1"><button aria-label="Previous page" disabled={!canPrevious || loading} onClick={() => tab === 'overview' ? void refreshInventory(page - 1) : void refreshMovements(page - 1)} className="grid h-8 w-8 place-items-center rounded border border-neutral-200 disabled:opacity-40"><ChevronLeft size={15}/></button><span className="px-2">{page} / {pageCount(currentTotal)}</span><button aria-label="Next page" disabled={page >= pageCount(currentTotal) || loading} onClick={() => tab === 'overview' ? void refreshInventory(page + 1) : void refreshMovements(page + 1)} className="grid h-8 w-8 place-items-center rounded border border-neutral-200 disabled:opacity-40"><ChevronRight size={15}/></button></div></div>;

  return <div className="mx-auto max-w-[1400px] text-neutral-950">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-2xl font-black">Inventory</h2><p className="mt-1 text-xs text-neutral-600">Track and manage your stock across all products and variants.</p></div><div className="flex gap-2"><button onClick={() => openAdjustment()} className="h-9 border border-neutral-300 bg-white px-4 text-[11px] font-semibold hover:border-[#d28a00]">Stock Adjustment</button><button onClick={() => { setActionError(''); setActionMessage(''); setImportRows([]); setImportOpen(true); }} className="inline-flex h-9 items-center gap-2 bg-[#d48100] px-4 text-[11px] font-bold text-white hover:bg-[#bd7200]"><FileUp size={14}/>Import Stock</button></div></div>
    <div className="mt-4 flex gap-6 overflow-x-auto border-b border-neutral-200">{tabs.map((item) => <button key={item.id} onClick={() => { setTab(item.id); setPage(1); setError(''); }} className={`whitespace-nowrap border-b-2 px-1 pb-3 text-[11px] font-semibold ${tab === item.id ? 'border-[#dc8c00] text-[#9b5c00]' : 'border-transparent text-neutral-600 hover:text-black'}`}>{item.label}</button>)}</div>
    {actionMessage && <div role="status" className="mt-3 flex justify-between border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-800">{actionMessage}<button onClick={() => setActionMessage('')} aria-label="Dismiss message"><X size={14}/></button></div>}
    <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4">{[
      ['Total Stock Items', summary.totalItems, 'text-neutral-950'], ['Total Stock Qty', summary.totalQuantity, 'text-neutral-950'], ['Low Stock Items', summary.lowStockItems, 'text-orange-600'], ['Out of Stock Items', summary.outOfStockItems, 'text-red-600'],
    ].map(([label, value, color]) => <article key={String(label)} className="rounded border border-neutral-200 bg-white px-4 py-3"><p className="flex items-center gap-2 text-[10px] font-semibold text-neutral-600"><span className={`h-2 w-2 rounded-full ${label === 'Low Stock Items' ? 'bg-orange-500' : label === 'Out of Stock Items' ? 'bg-red-500' : 'bg-neutral-500'}`}/>{label}</p><p className={`mt-1 text-xl font-black ${color}`}>{number(value)}</p></article>)}</div>
    <div className="mt-3 grid gap-2 lg:grid-cols-[minmax(220px,1.4fr)_repeat(3,minmax(135px,1fr))_auto]">
      <label className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={15}/><input aria-label="Search products" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search products..." className="h-9 w-full rounded border border-neutral-300 bg-white pl-9 pr-3 text-[11px] outline-none focus:border-[#d28a00]"/></label>
      {tab === 'overview' ? <>
        <select aria-label="Filter by category" value={categoryId} onChange={(event) => { setCategoryId(event.target.value); setPage(1); }} className="h-9 rounded border border-neutral-300 bg-white px-3 text-[11px] text-neutral-700"><option value="">All Categories</option>{categories.map((item) => <option key={String(item.id)} value={String(item.id)}>{String(item.name)}</option>)}</select>
        <select aria-label="Filter by brand" value={brandId} onChange={(event) => { setBrandId(event.target.value); setPage(1); }} className="h-9 rounded border border-neutral-300 bg-white px-3 text-[11px] text-neutral-700"><option value="">All Brands</option>{brands.map((item) => <option key={String(item.id)} value={String(item.id)}>{String(item.name)}</option>)}</select>
        <select aria-label="Filter by stock status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="h-9 rounded border border-neutral-300 bg-white px-3 text-[11px] text-neutral-700"><option value="">All Status</option><option value="IN_STOCK">In Stock</option><option value="LOW_STOCK">Low Stock</option><option value="OUT_OF_STOCK">Out of Stock</option></select>
      </> : <div className="flex items-center text-[11px] text-neutral-500">{tab === 'adjustments' ? 'Showing stock adjustments' : tab === 'damage-loss' ? 'Showing damaged and lost stock' : 'Showing all stock movements'}</div>}
      <button onClick={() => { setPage(1); if (tab === 'overview') void refreshInventory(1); else void refreshMovements(1); }} className="inline-flex h-9 items-center justify-center gap-2 rounded border border-neutral-300 bg-white px-4 text-[11px] font-semibold hover:border-[#d28a00]"><Filter size={14}/>Filter</button>
    </div>
    <section className="mt-3 overflow-hidden rounded border border-neutral-200 bg-white">
      {error ? <div role="alert" className="p-8 text-center text-sm text-red-700">{error}<button onClick={() => tab === 'overview' ? void refreshInventory(page) : void refreshMovements(page)} className="ml-2 underline">Retry</button></div> : loading ? <div className="p-10 text-center text-xs text-neutral-500">Loading inventory…</div> : tab === 'overview' ? inventoryItems.length ? <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-[10px]"><thead className="bg-neutral-50 text-neutral-600"><tr>{['Product', 'Variant / Size / Color', 'SKU', 'Stock Qty', 'Low Stock Threshold', 'Status', 'Actions'].map((label) => <th key={label} className="border-b border-neutral-200 px-3 py-2.5 font-semibold">{label}</th>)}</tr></thead><tbody className="divide-y divide-neutral-100">{inventoryItems.map((row) => { const current = stockState(row); const image = row.variant?.product?.images?.[0]?.image_url; const imageSrc = image && (/^https?:\/\//.test(image) ? image : `${apiOrigin}${image}`); return <tr key={row.id} className="hover:bg-neutral-50"><td className="px-3 py-2"><div className="flex items-center gap-2.5">{imageSrc ? <img src={imageSrc} alt="" className="h-9 w-9 rounded border border-neutral-100 object-contain"/> : <div className="grid h-9 w-9 place-items-center rounded bg-neutral-100 text-[8px] text-neutral-400">IMG</div>}<span className="font-semibold text-neutral-800">{productName(row)}</span></div></td><td className="px-3 py-2 text-neutral-600">{variantLabel(row)}</td><td className="px-3 py-2 font-medium text-neutral-700">{row.variant?.sku ?? '—'}</td><td className={`px-3 py-2 font-bold ${row.quantity === 0 ? 'text-red-600' : 'text-neutral-800'}`}>{number(row.quantity)}</td><td className="px-3 py-2 text-neutral-700">{number(row.min_stock)}</td><td className="px-3 py-2"><span className={`rounded px-2 py-1 font-semibold ${current.className}`}>{current.label}</span></td><td className="px-3 py-2"><button onClick={() => void openDetails(row)} aria-label={`View ${productName(row)} inventory`} className="grid h-8 w-8 place-items-center rounded border border-neutral-200 text-neutral-600 hover:border-[#d28a00] hover:text-[#9b5c00]"><Eye size={15}/></button></td></tr>; })}</tbody></table></div> : <div className="p-10 text-center text-xs text-neutral-500">No inventory items match these filters.</div> : movementItems.length ? <div className="overflow-x-auto"><table className="w-full min-w-[780px] text-left text-[10px]"><thead className="bg-neutral-50 text-neutral-600"><tr>{['Date', 'Product', 'Variant / Size / Color', 'SKU', 'Movement Type', 'Quantity', 'Reason'].map((label) => <th key={label} className="border-b border-neutral-200 px-3 py-2.5 font-semibold">{label}</th>)}</tr></thead><tbody className="divide-y divide-neutral-100">{movementItems.map((row) => <tr key={row.id} className="hover:bg-neutral-50"><td className="px-3 py-3 text-neutral-600">{new Date(row.created_at).toLocaleString()}</td><td className="px-3 py-3 font-semibold">{productName(row)}</td><td className="px-3 py-3 text-neutral-600">{variantLabel(row)}</td><td className="px-3 py-3">{row.variant?.sku ?? '—'}</td><td className="px-3 py-3"><span className={`rounded px-2 py-1 font-semibold ${statusForMovement(row.movement_type)}`}>{row.movement_type.replaceAll('_', ' ')}</span></td><td className={`px-3 py-3 font-bold ${row.movement_type === 'DAMAGE' || row.movement_type === 'LOST' || row.movement_type === 'STOCK_OUT' ? 'text-red-600' : 'text-neutral-800'}`}>{movementAmount(row)}</td><td className="max-w-56 truncate px-3 py-3 text-neutral-600">{row.reference || '—'}</td></tr>)}</tbody></table></div> : <div className="p-10 text-center text-xs text-neutral-500">No stock movements found.</div>}
      {!error && !loading && pagination}
    </section>

    {adjustmentOpen && <div role="dialog" aria-modal="true" aria-labelledby="inventory-adjustment-title" className="fixed inset-0 z-[60] grid place-items-center bg-black/50 p-4"><form onSubmit={saveMovement} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded border border-neutral-200 bg-white shadow-xl"><header className="flex items-center justify-between border-b border-neutral-200 px-5 py-4"><div><p className="text-[10px] font-semibold uppercase tracking-widest text-[#966800]">Inventory</p><h2 id="inventory-adjustment-title" className="mt-1 text-base font-bold">Stock Adjustment</h2></div><button type="button" aria-label="Close" onClick={() => setAdjustmentOpen(false)}><X size={18}/></button></header><div className="space-y-4 p-5"><p className="text-[11px] leading-5 text-neutral-600">Set stock to the counted quantity, record stock received or removed, or log damage and loss. Every saved change appears in the matching inventory history tab.</p><label className="block text-xs font-semibold">Search products or SKU<input value={itemSearch} onChange={(event) => { setItemSearch(event.target.value); setSelectedProductId(''); setVariantId(''); }} placeholder="Type a product name or SKU" className="mt-1.5 h-10 w-full border border-neutral-300 px-3 text-xs font-normal"/></label><label className="block text-xs font-semibold">Product<select required value={selectedProductId} onChange={(event) => { setSelectedProductId(event.target.value); setVariantId(''); const product = visibleProducts.find((item) => item.id === event.target.value); if (product) setItemSearch(product.name); }} className="mt-1.5 h-10 w-full border border-neutral-300 bg-white px-3 text-xs font-normal"><option value="">Select a product</option>{visibleProducts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className="block text-xs font-semibold">Product variant<select required value={variantId} disabled={!selectedProductId} onChange={(event) => { setVariantId(event.target.value); const found = visibleVariants.find((item) => item.variant_id === event.target.value); if (found) setMinStock(String(found.min_stock)); }} className="mt-1.5 h-10 w-full border border-neutral-300 bg-white px-3 text-xs font-normal disabled:bg-neutral-100"><option value="">Select a variant</option>{visibleVariants.map((item) => <option key={item.variant_id} value={item.variant_id}>{item.variant?.sku} · {variantLabel(item)} · Stock {item.quantity}</option>)}</select></label><label className="block text-xs font-semibold">Change type<select value={movementType} onChange={(event) => setMovementType(event.target.value as MovementType)} className="mt-1.5 h-10 w-full border border-neutral-300 bg-white px-3 text-xs font-normal"><option value="ADJUSTMENT">Set stock quantity</option><option value="STOCK_IN">Stock received</option><option value="STOCK_OUT">Stock removed</option><option value="DAMAGE">Damaged stock</option><option value="LOST">Lost stock</option></select></label><label className="block text-xs font-semibold">{movementType === 'ADJUSTMENT' ? 'New stock quantity' : 'Quantity'}<input required type="number" min={movementType === 'ADJUSTMENT' ? '0' : '1'} step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} className="mt-1.5 h-10 w-full border border-neutral-300 px-3 text-xs font-normal"/></label><label className="block text-xs font-semibold">Low stock threshold<input type="number" min="0" step="1" value={minStock} onChange={(event) => setMinStock(event.target.value)} className="mt-1.5 h-10 w-full border border-neutral-300 px-3 text-xs font-normal"/><span className="mt-1 block text-[10px] font-normal text-neutral-500">Leave unchanged to keep the current threshold.</span></label><label className="block text-xs font-semibold">Reason / reference<input maxLength={255} value={reference} onChange={(event) => setReference(event.target.value)} placeholder="e.g. Monthly stock count" className="mt-1.5 h-10 w-full border border-neutral-300 px-3 text-xs font-normal"/></label>{actionError && <p role="alert" className="text-xs text-red-700">{actionError}</p>}</div><footer className="flex justify-end gap-2 border-t border-neutral-200 px-5 py-4"><button type="button" onClick={() => setAdjustmentOpen(false)} className="h-9 border border-neutral-300 px-4 text-xs font-semibold">Cancel</button><button disabled={saving} className="h-9 bg-[#d48100] px-5 text-xs font-bold text-white disabled:opacity-50">{saving ? 'Saving…' : 'Save Adjustment'}</button></footer></form></div>}

    {importOpen && <div role="dialog" aria-modal="true" aria-labelledby="inventory-import-title" className="fixed inset-0 z-[60] grid place-items-center bg-black/50 p-4"><section className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded border border-neutral-200 bg-white shadow-xl"><header className="flex items-center justify-between border-b border-neutral-200 px-5 py-4"><div><p className="text-[10px] font-semibold uppercase tracking-widest text-[#966800]">Inventory</p><h2 id="inventory-import-title" className="mt-1 text-base font-bold">Import Stock</h2></div><button aria-label="Close" onClick={() => setImportOpen(false)}><X size={18}/></button></header><div className="space-y-4 p-5"><p className="text-xs leading-5 text-neutral-600">Upload a CSV with <strong>SKU</strong> and <strong>Quantity</strong> columns. Optionally include <strong>Low Stock Threshold</strong>. Quantities are imported as the new on-hand totals, and changes are added to inventory history.</p><button onClick={downloadTemplate} className="text-xs font-semibold text-[#9b5c00] underline">Download CSV template</button><label className="flex cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center"><FileUp size={22} className="text-neutral-500"/><span className="text-xs font-semibold">{importName || 'Choose a CSV file'}</span><span className="text-[10px] text-neutral-500">.csv · up to 1,000 stock rows</span><input type="file" accept=".csv,text/csv" onChange={(event) => void readImport(event)} className="sr-only"/></label>{importRows.length > 0 && <><p className="text-xs font-semibold">Preview · {importRows.length} rows</p><div className="max-h-40 overflow-auto border border-neutral-200"><table className="w-full text-left text-[10px]"><thead className="bg-neutral-50"><tr><th className="px-3 py-2">SKU</th><th className="px-3 py-2">Quantity</th><th className="px-3 py-2">Threshold</th></tr></thead><tbody>{importRows.slice(0, 8).map((row) => <tr key={row.sku} className="border-t"><td className="px-3 py-2">{row.sku}</td><td className="px-3 py-2">{row.quantity}</td><td className="px-3 py-2">{row.minStock ?? 'Unchanged'}</td></tr>)}</tbody></table></div>{importRows.length > 8 && <p className="text-[10px] text-neutral-500">Showing 8 of {importRows.length} rows.</p>}</>}{actionError && <p role="alert" className="text-xs text-red-700">{actionError}</p>}</div><footer className="flex justify-end gap-2 border-t border-neutral-200 px-5 py-4"><button onClick={() => setImportOpen(false)} className="h-9 border border-neutral-300 px-4 text-xs font-semibold">Cancel</button><button disabled={!importRows.length || saving} onClick={() => void submitImport()} className="h-9 bg-[#d48100] px-5 text-xs font-bold text-white disabled:opacity-50">{saving ? 'Importing…' : `Import ${importRows.length || ''} Rows`}</button></footer></section></div>}

    {selected && <div role="dialog" aria-modal="true" aria-labelledby="inventory-detail-title" className="fixed inset-0 z-[60] grid place-items-center bg-black/50 p-4"><section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded border border-neutral-200 bg-white shadow-xl"><header className="flex items-center justify-between border-b border-neutral-200 px-5 py-4"><div><p className="text-[10px] font-semibold uppercase tracking-widest text-[#966800]">Stock Details</p><h2 id="inventory-detail-title" className="mt-1 text-base font-bold">{productName(selected)}</h2></div><button aria-label="Close" onClick={() => setSelected(null)}><X size={18}/></button></header><div className="grid gap-3 p-5 sm:grid-cols-2"><p className="border p-3 text-xs"><span className="block text-[10px] text-neutral-500">Variant</span>{variantLabel(selected)}</p><p className="border p-3 text-xs"><span className="block text-[10px] text-neutral-500">SKU</span>{selected.variant?.sku}</p><p className="border p-3 text-xs"><span className="block text-[10px] text-neutral-500">Current stock</span>{number(selected.quantity)}</p><p className="border p-3 text-xs"><span className="block text-[10px] text-neutral-500">Low stock threshold</span>{number(selected.min_stock)}</p></div><div className="px-5 pb-5"><div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-bold">Recent stock movements</h3><button onClick={() => { setSelected(null); openAdjustment(selected); }} className="text-xs font-semibold text-[#9b5c00] underline">Adjust stock</button></div>{detailLoading ? <p className="py-6 text-center text-xs text-neutral-500">Loading history…</p> : selectedMovements.length ? <ul className="divide-y border-y">{selectedMovements.slice(0, 10).map((item) => <li key={String(item.id)} className="flex flex-wrap justify-between gap-2 py-3 text-[10px]"><span className="font-semibold">{String(item.movementType).replaceAll('_', ' ')}</span><span>{number(item.quantity)} · {String(item.reference ?? '—')}</span><time className="text-neutral-500">{new Date(String(item.createdAt)).toLocaleString()}</time></li>)}</ul> : <p className="py-6 text-center text-xs text-neutral-500">No movements recorded for this variant.</p>}</div><footer className="flex justify-end border-t border-neutral-200 px-5 py-4"><button onClick={() => setSelected(null)} className="h-9 border border-neutral-300 px-4 text-xs font-semibold">Close</button></footer></section></div>}
  </div>;
}
