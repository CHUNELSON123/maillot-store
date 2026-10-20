'use client';

import { useEffect, useMemo, useState } from 'react';
import { Clipboard, UsersRound, Camera, Music2, CirclePlay } from 'lucide-react';
import { useInfluencerPortal } from './influencer-portal-context';

const money = (value: number) => `${Math.round(value).toLocaleString()} XAF`;

export function InfluencerReferralsPage() {
  const { data } = useInfluencerPortal();
  const [page, setPage] = useState(1);
  const [copied, setCopied] = useState('');
  const [origin, setOrigin] = useState('');
  const referrals = data?.referrals ?? [];
  const rows = useMemo(() => referrals.slice((page - 1) * 8, page * 8), [referrals, page]);
  useEffect(() => setOrigin(window.location.origin), []);
  if (!data) return null;
  const code = data.profile.referralCode;
  const link = `${origin}/shop?ref=${encodeURIComponent(code)}`;
  const pages = Math.max(1, Math.ceil(data.referrals.length / 8));
  const copy = async (id: string, text: string) => { try { await navigator.clipboard.writeText(text); setCopied(id); window.setTimeout(() => setCopied(''), 1500); } catch { setCopied(''); } };
  const orders = data.referrals.filter(item => item.orderId).length;
  const conversion = data.metrics.clicks ? orders / data.metrics.clicks * 100 : 0;
  const share = async (platform: string) => {
    if (navigator.share) { try { await navigator.share({ title: 'Maillot Store', url: link }); return; } catch { return; } }
    await copy(platform, link);
  };
  return <div className="mx-auto max-w-[1250px]"><div className="mb-5"><h1 className="text-2xl font-black">Referral / Sales Tracking</h1><p className="mt-1 text-xs text-neutral-600">Track visits and orders attributed to your referral links.</p></div>
    <section className="grid gap-3 border border-neutral-200 bg-white p-4 md:grid-cols-2"><div><p className="text-[10px] font-bold uppercase text-neutral-500">Your Referral Link</p><div className="mt-2 flex"><input aria-label="Your referral link" readOnly value={link} className="h-10 min-w-0 flex-1 border border-neutral-300 px-3 text-xs"/><button onClick={() => void copy('link', link)} aria-label="Copy referral link" className="flex h-10 w-11 items-center justify-center bg-black text-white"><Clipboard size={15}/></button></div></div><div><p className="text-[10px] font-bold uppercase text-neutral-500">Your Referral Code</p><div className="mt-2 flex"><input aria-label="Your referral code" readOnly value={code} className="h-10 min-w-0 flex-1 border border-neutral-300 px-3 text-xs font-bold"/><button onClick={() => void copy('code', code)} aria-label="Copy referral code" className="flex h-10 w-11 items-center justify-center bg-black text-white"><Clipboard size={15}/></button></div></div><div className="flex flex-wrap gap-2 md:col-span-2"><button aria-label="Share on Instagram" onClick={() => void share('instagram')} className="flex h-9 items-center gap-2 bg-[#4167B2] px-3 text-xs text-white"><Camera size={15}/>Instagram</button><button aria-label="Share on TikTok" onClick={() => void share('tiktok')} className="flex h-9 items-center gap-2 bg-black px-3 text-xs text-white"><Music2 size={15}/>TikTok</button><button aria-label="Share on YouTube" onClick={() => void share('youtube')} className="flex h-9 items-center gap-2 bg-red-600 px-3 text-xs text-white"><CirclePlay size={15}/>YouTube</button><button aria-label="Share on Facebook" onClick={() => void share('facebook')} className="flex h-9 items-center gap-2 bg-[#4167B2] px-3 text-xs text-white"><UsersRound size={15}/>Facebook</button><span role="status" className="self-center text-[10px] text-green-700">{copied ? 'Copied to clipboard' : ''}</span></div></section>
    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[['Total Clicks', data.metrics.clicks],['Total Orders',orders],['Conversion Rate',`${conversion.toFixed(2)}%`],['Sales (XAF)',money(data.metrics.sales)]].map(([label,value])=><article key={String(label)} className="border border-neutral-200 bg-white p-4"><p className="text-[10px] text-neutral-500">{label}</p><p className="mt-2 text-xl font-black">{value}</p><p className="mt-1 text-[10px] text-neutral-400">Based on recorded referrals</p></article>)}</div>
    <section className="mt-4 border border-neutral-200 bg-white p-4"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-sm font-extrabold">Recent Referrals</h2><p className="mt-1 text-[10px] text-neutral-500">Visitor identity and location are not collected by the current referral model.</p></div><span className="text-[10px] text-neutral-500">{data.referrals.length} records</span></div>{rows.length ? <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-[10px]"><thead className="border-b text-neutral-500"><tr><th className="py-3 pr-3">Date</th><th className="pr-3">Visitor</th><th className="pr-3">Location</th><th className="pr-3">Order</th><th className="pr-3">Sales (XAF)</th><th>Status</th></tr></thead><tbody>{rows.map(item=><tr key={item.id} className="border-b border-neutral-100"><td className="py-3 pr-3">{new Date(item.createdAt).toLocaleDateString()}</td><td className="pr-3">{item.orderId ? (item.customerLabel?.includes('@') ? 'Customer' : 'Guest') : 'Referral visit'}</td><td className="pr-3">—</td><td className="pr-3">{item.orderNumber ?? '—'}</td><td className="pr-3">{item.saleAmount === null ? '—' : money(item.saleAmount)}</td><td><span className="inline-flex border border-neutral-200 px-2 py-1">{item.orderStatus ?? item.status}</span></td></tr>)}</tbody></table></div> : <div className="py-10 text-center text-xs text-neutral-500">No referral activity yet. Share your link to start recording visits.</div>}
      <div className="mt-4 flex items-center justify-center gap-3"><button disabled={page <= 1} onClick={() => setPage(p => Math.max(1,p-1))} className="h-8 w-8 border text-xs disabled:opacity-40">‹</button><span className="text-xs">Page {page} of {pages}</span><button disabled={page >= pages} onClick={() => setPage(p => p+1)} className="h-8 w-8 border text-xs disabled:opacity-40">›</button></div>
    </section>
  </div>;
}
