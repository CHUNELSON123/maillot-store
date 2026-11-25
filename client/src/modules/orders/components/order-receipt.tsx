'use client';

import { Printer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cmsService } from '@/modules/cms/services/cms.service';

export type OrderReceiptData = {
  orderNumber: string;
  orderDate: string;
  customerName: string;
  email?: string;
  phone?: string;
  fulfillment: string;
  paymentMethod?: string;
  paymentStatus?: string;
  items: Array<{ name: string; variant?: string; sku?: string; quantity: number; unitPrice: number }>;
  subtotal: number;
  discount?: number;
  deliveryFee?: number;
  total: number;
};

const amount = (value: number) => `${Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} XAF`;

export function OrderReceipt({ data }: { data: OrderReceiptData }) {
  const [business, setBusiness] = useState({ name: 'Maillot Store', address: '', phone: '', taxId: '' });
  useEffect(() => {
    let mounted = true;
    void cmsService.getPublicContent().then((content) => {
      if (mounted) setBusiness({
        name: content['store.business_name'] || content['store.site_name'] || 'Maillot Store',
        address: content['store.business_address'] || [content['cms.contact.address_line'], content['cms.contact.quarter'], content['cms.contact.city'], content['cms.contact.country']].map((part) => part?.trim()).filter(Boolean).join(', '),
        phone: content['cms.contact.phone'] || content['store.business_phone'] || '',
        taxId: content['store.business_tax_id'] || '',
      });
    }).catch(() => undefined);
    return () => { mounted = false; };
  }, []);
  return <section className="order-receipt-area">
    <style jsx global>{`@media print { body * { visibility: hidden !important; } .order-receipt-area, .order-receipt-area * { visibility: visible !important; } .order-receipt-area { position: absolute !important; inset: 0 auto auto 0 !important; width: 100% !important; padding: 20px !important; background: white !important; } .order-receipt-area .receipt-print-button { display: none !important; } }`}</style>
    <div className="receipt-print-button mb-3 flex justify-end"><button onClick={() => window.print()} className="inline-flex items-center gap-2 border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold hover:border-[#d28a00]"><Printer size={15}/>Print receipt</button></div>
    <article className="mx-auto max-w-xl border border-neutral-200 bg-white p-6 text-neutral-950">
      <header className="border-b border-dashed border-neutral-300 pb-4 text-center"><p className="text-xl font-black">{business.name.toUpperCase()}</p>{business.address && <p className="mt-1 text-[10px] text-neutral-500">{business.address}</p>}{business.phone && <p className="text-[10px] text-neutral-500">{business.phone}</p>}{business.taxId && <p className="text-[10px] text-neutral-500">Tax ID: {business.taxId}</p>}<p className="mt-1 text-xs text-neutral-500">Sales receipt</p><p className="mt-3 text-sm font-bold">#{data.orderNumber}</p><p className="mt-1 text-[11px] text-neutral-500">{new Date(data.orderDate).toLocaleString()}</p></header>
      <section className="grid grid-cols-2 gap-3 border-b border-dashed border-neutral-300 py-4 text-xs"><div><span className="block text-[10px] uppercase text-neutral-500">Customer</span>{data.customerName}</div><div><span className="block text-[10px] uppercase text-neutral-500">Fulfillment</span>{data.fulfillment}</div>{data.phone && <div><span className="block text-[10px] uppercase text-neutral-500">Phone</span>{data.phone}</div>}{data.email && <div className="break-all"><span className="block text-[10px] uppercase text-neutral-500">Email</span>{data.email}</div>}</section>
      <table className="w-full text-left text-xs"><thead><tr className="border-b border-neutral-200 text-neutral-500"><th className="py-2">Item</th><th className="py-2 text-center">Qty</th><th className="py-2 text-right">Amount</th></tr></thead><tbody className="divide-y divide-neutral-100">{data.items.map((item, index) => <tr key={`${item.sku ?? item.name}-${index}`}><td className="py-2.5"><span className="block font-semibold">{item.name}</span><span className="text-[10px] text-neutral-500">{[item.variant, item.sku].filter(Boolean).join(' · ')}</span></td><td className="py-2.5 text-center">{item.quantity}</td><td className="py-2.5 text-right">{amount(item.unitPrice * item.quantity)}</td></tr>)}</tbody></table>
      <section className="ml-auto mt-4 max-w-xs space-y-2 text-xs"><div className="flex justify-between"><span>Subtotal</span><span>{amount(data.subtotal)}</span></div>{Boolean(data.discount) && <div className="flex justify-between"><span>Discount</span><span>−{amount(data.discount ?? 0)}</span></div>}{Boolean(data.deliveryFee) && <div className="flex justify-between"><span>Delivery</span><span>{amount(data.deliveryFee ?? 0)}</span></div>}<div className="flex justify-between border-t border-neutral-300 pt-2 text-sm font-bold"><span>Total</span><span>{amount(data.total)}</span></div></section>
      <footer className="mt-5 border-t border-dashed border-neutral-300 pt-3 text-[10px] text-neutral-500"><p>Payment: {data.paymentMethod ?? '—'} · {data.paymentStatus ?? '—'}</p><p className="mt-2 text-center">Thank you for shopping with Maillot Store.</p></footer>
    </article>
  </section>;
}
