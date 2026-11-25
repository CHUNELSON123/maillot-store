'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { CustomerLayout } from '@/modules/customer/components/customer-layout';
import { authStorage } from '@/lib/auth/auth-storage';
import { apiClient } from '@/services/api/api-client';
import { cmsService } from '@/modules/cms/services/cms.service';
import { orderConfirmationStorage } from '@/modules/orders/services/order-confirmation-storage';

type Method = 'mtn' | 'orange' | 'cash';
type SavedOrder = { orderId: string; guestAccessToken?: string; email: string };

export default function PaymentPage() {
  const [order, setOrder] = useState<SavedOrder | null>(null);
  const [total, setTotal] = useState(0);
  const [orderNumber, setOrderNumber] = useState('');
  const [method, setMethod] = useState<Method>('mtn');
  const [enabled, setEnabled] = useState<Method[]>(['mtn', 'orange', 'cash']);
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    try { const saved = sessionStorage.getItem('maillot-pending-notch'); if (saved) setOrder(JSON.parse(saved)); } catch { /* Invalid browser state is treated as a missing order. */ }
    const confirmation = orderConfirmationStorage.get();
    if (confirmation) { setTotal(confirmation.total); setOrderNumber(confirmation.orderNumber); }
    void cmsService.getPublicContent().then(content => {
      const raw = content['store.payment_methods_enabled'];
      if (raw === undefined) return;
      const aliases: Record<string, Method> = { mtn: 'mtn', 'mtn mobile money': 'mtn', orange: 'orange', 'orange money': 'orange', cash: 'cash', 'cash before delivery': 'cash', cod: 'cash' };
      const options = [...new Set(raw.toLowerCase().split(/[\n,;]+/).map(v => aliases[v.trim()]).filter((v): v is Method => Boolean(v)))];
      setEnabled(options); if (options.length) setMethod(options[0]);
    }).catch(() => undefined);
  }, []);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!order || busy || !enabled.includes(method)) return;
    const normalized = phone.replace(/[\s()-]/g, '').replace(/^0(?=\d{9}$)/, '');
    const international = normalized.startsWith('+237') ? normalized : normalized.startsWith('237') ? `+${normalized}` : `+237${normalized}`;
    if (method !== 'cash' && !/^\+237\d{9}$/.test(international)) { setError('Enter a valid Cameroon mobile money number.'); return; }
    setBusy(true); setError('');
    try {
      const token = authStorage.getStorefrontToken();
      await apiClient(method === 'cash' ? '/payments/notchpay/cash' : '/payments/notchpay/charge', { method: 'POST', ...(token ? { token } : {}), body: JSON.stringify(method === 'cash' ? order : { ...order, method, phone: international }) });
      if (method === 'cash') { sessionStorage.removeItem('maillot-pending-notch'); window.location.assign('/order-confirmed'); }
      else window.location.assign('/payment-result');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not start payment.'); }
    finally { setBusy(false); }
  };
  return <CustomerLayout><main className="mx-auto max-w-2xl px-5 py-10"><h1 className="text-2xl font-extrabold">Choose how to pay</h1><p className="mt-2 text-sm text-neutral-600">Your order has been placed. Select a payment method to continue.</p>{!order ? <div className="mt-6 border bg-white p-6 text-sm">No saved order was found. <Link href="/shop" className="underline">Continue shopping</Link>.</div> : <form onSubmit={submit} className="mt-6 space-y-5 border border-neutral-200 bg-white p-6"><div className="flex justify-between border-b pb-4 text-sm"><span>Order {orderNumber}</span><strong>{total.toLocaleString()} XAF</strong></div><fieldset><legend className="mb-3 text-sm font-bold">Payment method</legend><div className="grid gap-2 sm:grid-cols-2">{([['mtn','MTN Mobile Money'],['orange','Orange Money'],['cash','Cash before delivery']] as [Method,string][]).filter(([value]) => enabled.includes(value)).map(([value,label]) => <label key={value} className={`flex cursor-pointer items-center gap-3 border p-4 text-sm ${method === value ? 'border-[#D4AF37] bg-amber-50' : 'border-neutral-300'}`}><input type="radio" name="method" checked={method === value} onChange={() => setMethod(value)} className="accent-[#D4AF37]"/>{label}</label>)}</div>{!enabled.length && <p className="mt-2 text-sm text-red-700">No available payment methods are enabled. Please contact the store.</p>}</fieldset>{method !== 'cash' && <label className="block text-sm font-semibold">Mobile money number<input type="tel" required value={phone} onChange={event => setPhone(event.target.value)} placeholder="e.g. 670000000" autoComplete="tel" className="mt-2 h-11 w-full border border-neutral-300 px-3 outline-none focus:border-[#D4AF37]"/><span className="mt-1 block text-xs font-normal text-neutral-500">Enter the number you want to use for this payment. You may need to approve the request on your phone.</span></label>}{method === 'cash' && <p className="text-sm text-neutral-600">The store will arrange payment with you. Your payment will remain pending.</p>}{error && <p role="alert" className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error} <Link href="/payment-result" className="underline">Check payment status</Link></p>}<button disabled={busy || !enabled.length} className="h-11 w-full bg-[#D4AF37] px-5 text-sm font-bold disabled:opacity-50">{busy ? 'PLEASE WAIT...' : method === 'cash' ? 'CONFIRM PAYMENT METHOD' : `PAY ${total.toLocaleString()} XAF`}</button></form>}</main></CustomerLayout>;
}
