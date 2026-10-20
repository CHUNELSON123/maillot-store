'use client';

import Link from 'next/link';
import { ReactNode, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bell, ChevronDown, LayoutDashboard, Link2, LogOut, Menu, Package, ShoppingBag, UserRound, Wallet, X } from 'lucide-react';
import { authService } from '@/modules/auth/services/auth.service';
import { useInfluencerPortal } from './influencer-portal-context';

const nav = [
  { label: 'Dashboard', href: '/influencer/portal/dashboard', icon: LayoutDashboard },
  { label: 'Products / Campaigns', href: '/influencer/portal/products', icon: Package },
  { label: 'Referral / Sales Tracking', href: '/influencer/portal/referrals', icon: Link2 },
  { label: 'Earnings / Commissions', href: '/influencer/portal/earnings', icon: Wallet },
  { label: 'Profile / Settings', href: '/influencer/portal/profile', icon: UserRound },
];

function PendingReview() {
  const { data } = useInfluencerPortal();
  return <div className="mx-auto max-w-2xl border border-[#e8d9ab] bg-[#fffaf0] p-8 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#D4AF37] text-black">⌛</div><h2 className="mt-4 text-xl font-black">APPLICATION UNDER REVIEW</h2><p className="mt-2 text-sm leading-6 text-neutral-700">Your application is saved and pending approval. Referral links, sales tracking, and earnings tools will be available after the Maillot Store team approves your account.</p><p className="mt-4 text-xs text-neutral-500">Status: {data?.profile.status}</p></div>;
}

export function InfluencerPortalShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data, loading, error, refresh } = useInfluencerPortal();
  const [mobileOpen, setMobileOpen] = useState(false);
  const fullName = [data?.profile.profile.firstName, data?.profile.profile.lastName].filter(Boolean).join(' ') || 'Influencer';
  const logout = () => { authService.logout(); window.location.href = '/'; };
  const navLinks = <>{nav.map(({ label, href, icon: Icon }) => <Link key={href} href={href} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 px-3 py-3 text-xs font-semibold transition ${pathname === href ? 'bg-[#9d7100] text-white' : 'text-neutral-200 hover:bg-neutral-800'}`}><Icon size={16}/>{label}</Link>)}<button onClick={logout} className="mt-auto flex w-full items-center gap-3 border-t border-neutral-800 px-3 py-4 text-xs text-white hover:text-[#D4AF37]"><LogOut size={15}/>Logout</button></>;
  return <div className="min-h-screen bg-[#f7f7f7] text-neutral-950">
    <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-4">
      <div className="flex items-center gap-3"><button className="lg:hidden" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu size={21}/></button><Link href="/" className="text-lg font-black leading-none">MAILLOT<span className="block text-[10px] font-bold text-[#b4830b]">STORE</span></Link><Link href="/" aria-label="Go to storefront" className="inline-flex h-9 items-center gap-2 border border-neutral-300 px-3 text-xs font-semibold text-neutral-700 transition-colors hover:border-[#D4AF37] hover:text-[#9a7400]"><ShoppingBag size={15} aria-hidden="true"/><span>Storefront</span></Link></div>
      <div className="flex items-center gap-4"><Link href="/account/notifications" aria-label="Notifications" className="relative text-neutral-700 hover:text-[#a77b08]"><Bell size={18}/></Link><Link href="/influencer/portal/profile" className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-neutral-900 text-xs font-bold text-white">{data?.profile.profile.profilePictureUrl ? <img src={data.profile.profile.profilePictureUrl} alt="" className="h-full w-full object-cover"/> : fullName.slice(0,1).toUpperCase()}</span><span className="hidden text-xs sm:block">{fullName}<small className="block text-[10px] text-neutral-500">Influencer</small></span><ChevronDown size={13}/></Link></div>
    </header>
    <aside className="fixed bottom-0 left-0 top-16 z-20 hidden w-[230px] flex-col bg-[#080808] lg:flex"><p className="px-4 pb-3 pt-5 text-[10px] font-extrabold uppercase tracking-widest text-[#D4AF37]">INFLUENCER PORTAL</p><nav className="flex flex-1 flex-col">{navLinks}</nav></aside>
    {mobileOpen && <div className="fixed inset-0 z-50 bg-black/60 lg:hidden"><div className="flex h-full w-[min(300px,85vw)] flex-col bg-[#080808] p-3"><div className="flex items-center justify-between px-2 py-3"><span className="text-[10px] font-extrabold tracking-widest text-[#D4AF37]">INFLUENCER PORTAL</span><button aria-label="Close navigation" onClick={() => setMobileOpen(false)}><X className="text-white"/></button></div><nav className="flex flex-1 flex-col">{navLinks}</nav></div></div>}
    <main className="min-h-screen px-4 pb-10 pt-20 sm:px-6 lg:ml-[230px] lg:px-8">
      {loading && !data ? <div className="mx-auto mt-12 max-w-3xl border border-neutral-200 bg-white p-8 text-sm text-neutral-600">Loading your influencer portal…</div> : error ? <div className="mx-auto mt-12 max-w-3xl border border-red-200 bg-white p-6 text-sm text-red-700">{error}<button onClick={() => void refresh()} className="ml-3 font-bold underline">Retry</button></div> : data?.profile.status !== 'ACTIVE' ? <div className="mx-auto mt-10 max-w-4xl"><PendingReview/></div> : children}
    </main>
  </div>;
}
