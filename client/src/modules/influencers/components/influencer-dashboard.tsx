'use client';

import Link from 'next/link';
import { useInfluencerPortal } from './influencer-portal-context';

const money = (value: number) => `${Math.round(value).toLocaleString()} XAF`;

function ActivityChart({ activity }: { activity: { date: string; clicks: number; orders: number }[] }) {
  const max = Math.max(1, ...activity.flatMap((item) => [item.clicks, item.orders]));
  const points = (key: 'clicks' | 'orders') => activity.map((item, i) => `${20 + i * 55},${130 - (item[key] / max) * 105}`).join(' ');
  return <div className="overflow-hidden"><svg viewBox="0 0 370 155" role="img" aria-label="Clicks and attributed orders for the last seven days" className="h-[180px] w-full"><line x1="15" y1="130" x2="355" y2="130" stroke="#e5e5e5"/><line x1="15" y1="75" x2="355" y2="75" stroke="#f0f0f0"/><line x1="15" y1="20" x2="355" y2="20" stroke="#f0f0f0"/><polyline points={points('clicks')} fill="none" stroke="#d99000" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round"/><polyline points={points('orders')} fill="none" stroke="#111" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round"/>{activity.map((item, i) => <text key={item.date} x={20 + i * 55} y="150" textAnchor="middle" fontSize="8" fill="#737373">{new Date(`${item.date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short' })}</text>)}</svg><div className="flex justify-center gap-5 text-[10px]"><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-[#d99000]"/>Clicks</span><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-black"/>Orders</span></div></div>;
}

export function InfluencerDashboard() {
  const { data } = useInfluencerPortal();
  if (!data) return null;
  const { metrics, profile, referrals } = data;
  const name = profile.profile.firstName || 'there';
  const recentOrders = referrals.filter((item) => item.orderId).slice(0, 5);
  const productCounts = new Map<string, number>();
  referrals.forEach((ref) => ref.productNames.forEach((product) => productCounts.set(product, (productCounts.get(product) ?? 0) + 1)));
  const topProducts = [...productCounts].sort((a,b) => b[1] - a[1]).slice(0, 4);
  const cards = [
    ['Clicks', metrics.clicks, 'Recorded referral visits'],
    ['Orders', metrics.orders, 'Orders attributed to your links'],
    ['Sales (XAF)', money(metrics.sales), 'Attributed order totals'],
    ['Earnings (XAF)', money(metrics.totalEarnings), 'Commission records to date'],
  ];
  return <div className="mx-auto max-w-[1250px]">
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-black">Welcome back, {name}! <span aria-hidden="true">👋</span></h1><p className="mt-1 text-xs text-neutral-600">Here’s your performance overview.</p></div><div className="border border-neutral-200 bg-white px-3 py-2 text-[10px] font-semibold">All-time performance</div></div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value, note], i) => <article key={String(label)} className="border border-neutral-200 bg-white p-4"><p className="text-[10px] font-semibold text-neutral-500">{label}</p><p className="mt-2 text-2xl font-black">{value}</p><p className="mt-2 text-[10px] text-neutral-500">{note}</p></article>)}</div>
    <div className="mt-4 grid gap-4 xl:grid-cols-[1.45fr_1fr]"><section className="border border-neutral-200 bg-white p-4"><div className="mb-3 flex items-center justify-between"><div><h2 className="text-sm font-extrabold">Performance Overview</h2><p className="mt-1 text-[10px] text-neutral-500">Activity recorded over the last seven days</p></div><span className="text-[10px] text-neutral-500">Daily</span></div><ActivityChart activity={data.activity}/></section>
      <section className="border border-neutral-200 bg-white p-4"><div className="flex items-center justify-between"><h2 className="text-sm font-extrabold">Your Summary</h2><Link href="/influencer/portal/earnings" className="text-[10px] font-bold text-[#9a7107]">EARNINGS</Link></div><div className="mt-4 space-y-3 text-xs"><div className="flex justify-between"><span className="text-neutral-600">Available Balance</span><strong>{money(metrics.availableBalance)}</strong></div><div className="flex justify-between"><span className="text-neutral-600">Pending Commissions</span><strong>{money(metrics.pendingEarnings)}</strong></div><div className="flex justify-between"><span className="text-neutral-600">Total Earned</span><strong>{money(metrics.totalEarnings)}</strong></div><div className="flex justify-between"><span className="text-neutral-600">Total Withdrawn</span><strong>{money(metrics.totalWithdrawn)}</strong></div></div><Link href="/influencer/portal/referrals" className="mt-5 inline-block text-[10px] font-bold text-[#9a7107] underline">View referral activity</Link></section></div>
    <div className="mt-4 grid gap-4 xl:grid-cols-2"><section className="border border-neutral-200 bg-white p-4"><div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-extrabold">Top Performing Products</h2><Link href="/influencer/portal/products" className="text-[10px] font-bold text-[#9a7107]">VIEW ALL</Link></div>{topProducts.length ? <ul className="divide-y divide-neutral-100">{topProducts.map(([name,count]) => <li key={name} className="flex justify-between py-3 text-xs"><span>{name}</span><span className="font-bold">{count} attributed item{count === 1 ? '' : 's'}</span></li>)}</ul> : <p className="py-8 text-center text-xs text-neutral-500">Product performance will appear after a referred order is recorded.</p>}</section>
      <section className="border border-neutral-200 bg-white p-4"><div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-extrabold">Recent Orders</h2><Link href="/influencer/portal/referrals" className="text-[10px] font-bold text-[#9a7107]">VIEW ALL</Link></div>{recentOrders.length ? <div className="overflow-x-auto"><table className="w-full min-w-[450px] text-left text-[10px]"><thead><tr className="border-b text-neutral-500"><th className="py-2">Order</th><th>Date</th><th>Sale (XAF)</th><th>Status</th></tr></thead><tbody>{recentOrders.map(ref => <tr key={ref.id} className="border-b border-neutral-100"><td className="py-3 font-semibold">{ref.orderNumber ?? 'Order'}</td><td>{new Date(ref.createdAt).toLocaleDateString()}</td><td>{money(ref.saleAmount ?? 0)}</td><td>{ref.orderStatus ?? ref.status}</td></tr>)}</tbody></table></div> : <p className="py-8 text-center text-xs text-neutral-500">No attributed orders have been recorded yet.</p>}</section></div>
  </div>;
}
