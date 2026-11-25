'use client';

import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { adminService } from '../services/admin.service';
import { AdminRecord } from '../types/admin.types';
import { OrderReceipt, OrderReceiptData } from '@/modules/orders/components/order-receipt';
import { cmsService } from '@/modules/cms/services/cms.service';

type StockRow = AdminRecord & { variant_id: string; quantity: number; variant?: { id?: string; sku?: string; size?: string | null; color?: string | null; price?: number | string; product?: { name?: string } } };
type Line = { variantId: string; quantity: number; name: string; variant: string; sku: string; price: number; stock: number };
const paymentOptions = [{ value: 'cash', label: 'Cash' }, { value: 'mtn', label: 'MTN Mobile Money' }, { value: 'orange', label: 'Orange Money' }, { value: 'card', label: 'Bank Card' }] as const;

export function AdminWalkInOrderDialog({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [query, setQuery] = useState('');
  const [stock, setStock] = useState<StockRow[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'PICKUP' | 'DELIVERY'>('PICKUP');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('');
  const [configuredDeliveryFee, setConfiguredDeliveryFee] = useState(2000);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(50000);
  const [deliveryEnabled, setDeliveryEnabled] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mtn' | 'orange' | 'card'>('cash');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState<OrderReceiptData | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(true);
      adminService.getInventoryPage({ page: 1, limit: 100, search: query })
        .then((result) => setStock(result.items as StockRow[]))
        .catch((cause) => setError(cause instanceof Error ? cause.message : 'Could not load products.'))
        .finally(() => setLoading(false));
    }, query ? 250 : 0);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    void cmsService.getPublicContent().then((content) => {
      const fee = Number(content['store.delivery_fee'] ?? 2000);
      const threshold = Number(content['store.free_delivery_threshold'] ?? 50000);
      setConfiguredDeliveryFee(Number.isFinite(fee) && fee >= 0 ? fee : 2000);
      setFreeDeliveryThreshold(Number.isFinite(threshold) && threshold > 0 ? threshold : 0);
      setDeliveryEnabled(content['store.delivery_enabled'] !== 'false');
      if (content['store.delivery_enabled'] === 'false') setDeliveryMethod('PICKUP');
    }).catch(() => undefined);
  }, []);

  const itemsTotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const deliveryFee = deliveryMethod === 'DELIVERY' && !(freeDeliveryThreshold > 0 && itemsTotal >= freeDeliveryThreshold) ? configuredDeliveryFee : 0;
  const customerTotal = itemsTotal + deliveryFee;

  const add = (row: StockRow) => {
    const variant = row.variant;
    if (!variant?.id || Number(variant.price) <= 0) return;
    const line: Line = { variantId: variant.id, quantity: 1, name: variant.product?.name ?? 'Product', variant: [variant.size, variant.color].filter(Boolean).join(' / '), sku: variant.sku ?? '', price: Number(variant.price), stock: Number(row.quantity) };
    setLines((current) => {
      const existing = current.find((item) => item.variantId === line.variantId);
      return existing ? current.map((item) => item.variantId === line.variantId ? { ...item, quantity: Math.min(item.quantity + 1, line.stock) } : item) : [...current, line];
    });
    setError('');
  };

  const submit = async () => {
    if (!customerName.trim() || !phone.trim() || !lines.length) { setError('Enter the customer name and phone, then add at least one product.'); return; }
    if (deliveryMethod === 'DELIVERY' && (!deliveryAddress.trim() || !deliveryCity.trim())) { setError('Enter the delivery address and city.'); return; }
    setSaving(true); setError('');
    try {
      const result = await adminService.createWalkInOrder({ items: lines.map(({ variantId, quantity }) => ({ variantId, quantity })), paymentMethod, guestName: customerName.trim(), guestPhone: phone.trim(), guestEmail: email.trim() || undefined, deliveryMethod, deliveryAddress: deliveryMethod === 'DELIVERY' ? deliveryAddress.trim() : undefined, deliveryCity: deliveryMethod === 'DELIVERY' ? deliveryCity.trim() : undefined });
      const order = result as { orderNumber: string; createdAt: string; totalAmount: number; deliveryFee?: number; items: Array<{ quantity: number; unitPrice: number; productName?: string | null; size?: string | null; color?: string | null; sku?: string | null }> };
      const deliveryFee = Number(order.deliveryFee ?? 0);
      setReceipt({ orderNumber: order.orderNumber, orderDate: order.createdAt, customerName: customerName.trim(), email: email.trim(), phone: phone.trim(), fulfillment: deliveryMethod === 'DELIVERY' ? `Delivery to ${deliveryAddress.trim()}, ${deliveryCity.trim()}` : 'Store pickup', paymentMethod: paymentOptions.find((option) => option.value === paymentMethod)?.label, paymentStatus: 'PAID', items: order.items.map((item) => ({ name: item.productName ?? 'Product', variant: [item.size, item.color].filter(Boolean).join(' / '), sku: item.sku ?? '', quantity: item.quantity, unitPrice: item.unitPrice })), subtotal: order.totalAmount - deliveryFee, deliveryFee, total: order.totalAmount });
      onCreated();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not record the walk-in sale.'); }
    finally { setSaving(false); }
  };

  return <div role="dialog" aria-modal="true" aria-labelledby="walk-in-title" className="fixed inset-0 z-[70] grid place-items-center bg-black/50 p-4"><section className="max-h-[92vh] w-full max-w-3xl overflow-y-auto border border-neutral-200 bg-white shadow-xl"><header className="sticky top-0 flex items-center justify-between border-b bg-white px-5 py-4"><div><p className="text-[10px] font-semibold uppercase tracking-widest text-[#966800]">In-store sale</p><h2 id="walk-in-title" className="mt-1 text-base font-bold">Record walk-in order</h2></div><button aria-label="Close" onClick={onClose}><X size={18}/></button></header>
    {receipt ? <div className="p-5"><p className="mb-4 text-sm font-semibold text-green-700">Sale recorded and inventory updated.</p><OrderReceipt data={receipt}/><button onClick={onClose} className="mt-4 h-10 border border-neutral-300 px-4 text-xs font-semibold">Done</button></div> : <div className="space-y-5 p-5"><div className="grid gap-3 sm:grid-cols-3"><label className="text-xs font-semibold">Customer name<input value={customerName} onChange={(event) => setCustomerName(event.target.value)} className="mt-1 block h-10 w-full border border-neutral-300 px-3"/></label><label className="text-xs font-semibold">Phone<input value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-1 block h-10 w-full border border-neutral-300 px-3"/></label><label className="text-xs font-semibold">Email (optional)<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 block h-10 w-full border border-neutral-300 px-3"/></label></div>
      <label className="block text-xs font-semibold">Find a product<div className="mt-1 flex h-10 items-center gap-2 border border-neutral-300 px-3"><Search size={15}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products or SKU" className="w-full text-xs outline-none"/></div></label><div className="max-h-44 divide-y overflow-y-auto border">{loading ? <p className="p-3 text-xs text-neutral-500">Loading products…</p> : stock.map((row) => <button key={row.variant_id} type="button" disabled={Number(row.quantity) <= 0 || Number(row.variant?.price) <= 0} onClick={() => add(row)} className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-xs hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"><span><strong>{row.variant?.product?.name ?? 'Product'}</strong><span className="ml-2 text-neutral-500">{[row.variant?.size, row.variant?.color, row.variant?.sku].filter(Boolean).join(' · ')}</span></span><span className="whitespace-nowrap">{Number(row.variant?.price ?? 0).toLocaleString()} XAF · stock {row.quantity}</span></button>)}{!loading && !stock.length && <p className="p-3 text-xs text-neutral-500">No available products found.</p>}</div>
      {lines.length > 0 && <div className="divide-y border-y">{lines.map((line) => <div key={line.variantId} className="flex items-center gap-3 py-2 text-xs"><span className="flex-1">{line.name}<small className="block text-neutral-500">{line.variant} {line.sku}</small></span><input aria-label={`Quantity for ${line.name}`} type="number" min="1" max={line.stock} value={line.quantity} onChange={(event) => setLines((current) => current.map((item) => item.variantId === line.variantId ? { ...item, quantity: Math.min(line.stock, Math.max(1, Number(event.target.value))) } : item))} className="w-16 border px-2 py-1"/><strong>{(line.price * line.quantity).toLocaleString()} XAF</strong><button aria-label={`Remove ${line.name}`} onClick={() => setLines((current) => current.filter((item) => item.variantId !== line.variantId))}><X size={14}/></button></div>)}</div>}
      <div className="grid gap-3 border-t pt-4 sm:grid-cols-2"><label className="text-xs font-semibold">Fulfillment<select value={deliveryMethod} onChange={(event) => setDeliveryMethod(event.target.value as typeof deliveryMethod)} className="mt-1 block h-10 w-full border border-neutral-300 bg-white px-3"><option value="PICKUP">Store pickup</option>{deliveryEnabled && <option value="DELIVERY">Delivery</option>}</select></label>{deliveryMethod === 'DELIVERY' && <><label className="text-xs font-semibold">Delivery address<input value={deliveryAddress} onChange={(event) => setDeliveryAddress(event.target.value)} className="mt-1 block h-10 w-full border border-neutral-300 px-3"/></label><label className="text-xs font-semibold">Delivery city<input value={deliveryCity} onChange={(event) => setDeliveryCity(event.target.value)} className="mt-1 block h-10 w-full border border-neutral-300 px-3"/></label></>}</div>
      <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-end"><label className="flex-1 text-xs font-semibold">Payment received via<select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as typeof paymentMethod)} className="mt-1 block h-10 w-full border border-neutral-300 bg-white px-3">{paymentOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label><div className="text-right text-xs"><p>Items: {itemsTotal.toLocaleString()} XAF</p>{deliveryMethod === 'DELIVERY' && <p>Delivery: {deliveryFee.toLocaleString()} XAF</p>}<strong className="mt-1 block text-sm">Customer total: {customerTotal.toLocaleString()} XAF</strong></div><button onClick={() => void submit()} disabled={saving} className="h-10 bg-[#d48100] px-5 text-xs font-bold text-white disabled:opacity-50">{saving ? 'Recording…' : 'Record sale'}</button></div>{error && <p role="alert" className="text-xs text-red-700">{error}</p>}</div>}
  </section></div>;
}
