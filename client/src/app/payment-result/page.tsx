'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { authStorage } from '@/lib/auth/auth-storage';
import { apiClient } from '@/services/api/api-client';

export default function PaymentResultPage() {
  const [status, setStatus] = useState<'loading' | 'paid' | 'pending' | 'failed' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const started = useRef(false);
  const verify = useCallback(async () => {
    setStatus('loading'); setMessage('');
    try {
      const raw = sessionStorage.getItem('maillot-pending-notch');
      if (!raw) throw new Error('This browser cannot find the saved order. Please contact the store with your order number.');
      const token = authStorage.getStorefrontToken();
      const result = await apiClient<{ status: string }>('/payments/notchpay/verify', { method: 'POST', ...(token ? { token } : {}), body: raw });
      if (result.status === 'PAID') { sessionStorage.removeItem('maillot-pending-notch'); setStatus('paid'); }
      else if (result.status === 'FAILED') setStatus('failed');
      else setStatus('pending');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to verify payment.'); setStatus('error'); }
  }, []);
  const retryPayment = async () => {
    window.location.assign('/payment');
  };
  useEffect(() => { if (!started.current) { started.current = true; void verify(); } }, [verify]);
  return <main className="mx-auto max-w-xl px-5 py-20 text-center"><h1 className="text-2xl font-bold">{status === 'paid' ? 'Payment verified' : status === 'loading' ? 'Checking payment' : 'Payment not yet verified'}</h1><p className="mt-4 text-sm text-neutral-600">{status === 'paid' ? 'Your payment was confirmed by Notch Pay.' : status === 'loading' ? 'Please wait while we check the result with Notch Pay.' : message || (status === 'failed' ? 'The payment was not completed. You can try again for the same order.' : 'Approve the payment request on your phone, then check again. Your order remains pending until payment is verified.')}</p>{(status === 'pending' || status === 'error') && <button type="button" onClick={() => void verify()} className="mt-6 bg-[#D4AF37] px-5 py-3 text-sm font-bold">Check again</button>}{status === 'failed' && <button type="button" onClick={() => void retryPayment()} className="mt-6 bg-[#D4AF37] px-5 py-3 text-sm font-bold">Try payment again</button>}<div className="mt-6"><Link href="/order-confirmed" className="text-sm underline">View order details</Link></div></main>;
}
