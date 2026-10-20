'use client';

import { FormEvent, useState } from 'react';
import { influencerService } from '../services/influencer.service';
import { useInfluencerPortal } from './influencer-portal-context';

type Tab = 'commissions' | 'requests' | 'history';
const money = (value: number) => `${Math.round(value).toLocaleString()} XAF`;

export function InfluencerEarningsPage() {
  const { data, refresh } = useInfluencerPortal();
  const [tab, setTab] = useState<Tab>('commissions');
  const [amount, setAmount] = useState('');
  const [requestOpen, setRequestOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  if (!data) return null;
  const metrics = data.metrics;
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError(''); setMessage('');
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0 || parsed > metrics.availableBalance) { setError('Enter an amount greater than zero and no more than your available balance.'); return; }
    setBusy(true);
    try {
      const result = await influencerService.requestWithdrawal(parsed) as { status?: string };
      setMessage(`Withdrawal request saved with status ${result.status ?? 'PENDING'}. This records a request; it does not represent a payment.`);
      setAmount(''); setRequestOpen(false); setTab('requests'); await refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not submit your request.'); }
    finally { setBusy(false); }
  };
  const commissions = data.commissions;
  const pendingRequests = data.withdrawals.filter(item => item.status === 'PENDING' || item.status === 'APPROVED');
  const history = data.withdrawals.filter(item => item.status === 'PAID' || item.status === 'REJECTED');
  const cards = [['Available Balance', money(metrics.availableBalance), 'After pending requests'], ['Pending Balance', money(metrics.pendingEarnings), 'Awaiting commission review'], ['Total Earned', money(metrics.totalEarnings), 'Recorded commission value'], ['Total Withdrawn', money(metrics.totalWithdrawn), 'Requests recorded as paid']];
  return <div className="mx-auto max-w-[1250px]"><div className="mb-5"><h1 className="text-2xl font-black">Earnings / Commissions</h1><p className="mt-1 text-xs text-neutral-600">Review recorded commissions and your withdrawal requests.</p></div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label,value,note])=><article key={label} className="border border-neutral-200 bg-white p-4"><p className="text-[10px] text-neutral-500">{label}</p><p className="mt-2 text-xl font-black">{value}</p><p className="mt-1 text-[10px] text-neutral-500">{note}</p></article>)}</div>
    {message && <p role="status" className="mt-4 border border-green-200 bg-green-50 p-3 text-xs text-green-800">{message}</p>}{error && <p role="alert" className="mt-4 border border-red-200 bg-red-50 p-3 text-xs text-red-700">{error}</p>}
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200"><div className="flex gap-5">{([['commissions','Commission History'],['requests','Withdrawal Requests'],['history','Withdrawal History']] as [Tab,string][]).map(([key,label])=><button key={key} onClick={() => setTab(key)} className={`border-b-2 pb-3 text-xs font-bold ${tab === key ? 'border-[#D4AF37] text-black' : 'border-transparent text-neutral-500'}`}>{label}</button>)}</div><button onClick={() => { setRequestOpen(v => !v); setTab('requests'); setError(''); setMessage(''); }} className="mb-2 h-9 bg-[#D4AF37] px-5 text-[10px] font-extrabold">REQUEST WITHDRAWAL</button></div>
    {requestOpen && <form onSubmit={submit} className="mt-4 grid gap-3 border border-neutral-200 bg-white p-4 sm:grid-cols-[1fr_auto] sm:items-end"><label className="text-xs font-semibold">Amount (XAF)<input type="number" min="1" step="0.01" max={metrics.availableBalance} value={amount} onChange={e => setAmount(e.target.value)} required className="mt-1.5 h-10 w-full border border-neutral-300 px-3 text-sm outline-none focus:border-[#D4AF37]"/><span className="mt-1 block text-[10px] font-normal text-neutral-500">Available: {money(metrics.availableBalance)}. No minimum amount is configured in this application.</span></label><button disabled={busy || metrics.availableBalance <= 0} className="h-10 bg-[#D4AF37] px-6 text-xs font-bold disabled:opacity-50">{busy ? 'SUBMITTING…' : 'SUBMIT REQUEST'}</button></form>}
    <section className="mt-4 overflow-x-auto border border-neutral-200 bg-white p-4">{tab === 'commissions' ? commissions.length ? <table className="w-full min-w-[600px] text-left text-[10px]"><thead className="border-b text-neutral-500"><tr><th className="py-3">Date</th><th>Order / Commission</th><th>Rate at sale</th><th>Amount (XAF)</th><th>Status</th></tr></thead><tbody>{commissions.map(item=><tr key={item.id} className="border-b border-neutral-100"><td className="py-3">{new Date(item.createdAt).toLocaleDateString()}</td><td>{item.id.slice(0,8).toUpperCase()}</td><td>{item.commissionRateSnapshot === null ? 'Legacy record' : `${item.commissionRateSnapshot}%`}</td><td>{money(item.amount)}</td><td>{item.status}</td></tr>)}</tbody></table> : <p className="py-10 text-center text-xs text-neutral-500">Commission records will appear after a referred order is delivered.</p> : tab === 'requests' ? pendingRequests.length ? <table className="w-full min-w-[500px] text-left text-[10px]"><thead className="border-b text-neutral-500"><tr><th className="py-3">Date</th><th>Request</th><th>Amount (XAF)</th><th>Status</th></tr></thead><tbody>{pendingRequests.map(item=><tr key={item.id} className="border-b border-neutral-100"><td className="py-3">{new Date(item.createdAt).toLocaleDateString()}</td><td>{item.id.slice(0,8).toUpperCase()}</td><td>{money(item.amount)}</td><td>{item.status}</td></tr>)}</tbody></table> : <p className="py-10 text-center text-xs text-neutral-500">You have no pending withdrawal requests.</p> : history.length ? <table className="w-full min-w-[600px] text-left text-[10px]"><thead className="border-b text-neutral-500"><tr><th className="py-3">Date</th><th>Request</th><th>Amount (XAF)</th><th>Status</th><th>Payment Reference</th></tr></thead><tbody>{history.map(item=><tr key={item.id} className="border-b border-neutral-100"><td className="py-3">{new Date(item.processedAt ?? item.createdAt).toLocaleDateString()}</td><td>{item.id.slice(0,8).toUpperCase()}</td><td>{money(item.amount)}</td><td>{item.status}</td><td>{item.paymentReference ?? '—'}</td></tr>)}</tbody></table> : <p className="py-10 text-center text-xs text-neutral-500">Paid or rejected withdrawal records will appear here.</p>}</section>
  </div>;
}
