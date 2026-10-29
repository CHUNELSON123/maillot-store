'use client';

import Link from 'next/link';
import { ReactNode, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bell, Boxes, ChartNoAxesCombined, ChevronDown, ClipboardList, ExternalLink, FileText, LayoutDashboard, LogOut, Menu, Package, Settings, ShoppingBag, Truck, Users, Wallet, X } from 'lucide-react';
import { useAuth } from '@/modules/auth/hooks/use-auth';
import { authService } from '@/modules/auth/services/auth.service';

const nav = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Categories / Brands', href: '/admin/categories-brands', icon: Boxes },
  { label: 'Inventory', href: '/admin/inventory', icon: ClipboardList },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Influencers', href: '/admin/influencers', icon: Users },
  { label: 'Payments', href: '/admin/payments', icon: Wallet },
  { label: 'Delivery', href: '/admin/delivery', icon: Truck },
  { label: 'Reports & Analytics', href: '/admin/reports', icon: ChartNoAxesCombined },
  { label: 'Website Content', href: '/admin/cms', icon: FileText },
  { label: 'Users & Permissions', href: '/admin/users', icon: Users },
  { label: 'System Settings', href: '/admin/settings', icon: Settings },
];

export function AdminPortalShell({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const path = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const role = user?.roleName;
  const allowed = role === 'Administrator' || role === 'Staff';
  const signOut = () => { authService.logout(); logout(); window.location.assign('/login'); };
  const visibleNav = role === 'Administrator' ? nav : nav.filter(({ href }) => href !== '/admin/users' && href !== '/admin/settings');
  const links = <>{visibleNav.map(({ label, href, icon: Icon }) => <Link key={href} href={href} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 text-xs font-medium transition ${path === href ? 'bg-[#a86c00] text-white' : 'text-neutral-200 hover:bg-neutral-800'}`}><Icon size={15}/>{label}</Link>)}<button onClick={signOut} className="mt-auto flex w-full items-center gap-3 border-t border-neutral-800 px-3 py-4 text-xs text-white hover:text-[#D4AF37]"><LogOut size={15}/>Logout</button></>;

  if (path === '/admin/setup' || path === '/admin/register' || path === '/admin/login') return <>{children}</>;

  if (isLoading) return <div className="grid min-h-screen place-items-center text-sm text-neutral-600">Checking administrator access…</div>;
  if (!isAuthenticated || !allowed) return <main className="grid min-h-screen place-items-center bg-neutral-100 p-6"><section className="max-w-md border border-neutral-200 bg-white p-8 text-center"><h1 className="text-xl font-bold">Administrator access</h1><p className="mt-2 text-sm text-neutral-600">Sign in to your Administrator account, or register a new one.</p>{isAuthenticated && <p className="mt-3 border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">This signed-in account does not have an Administrator or Staff role.</p>}<div className="mt-5 flex flex-col gap-2"><Link href="/admin/login" className="inline-flex justify-center bg-[#D4AF37] px-5 py-2.5 text-sm font-semibold text-black">Administrator sign in</Link><Link href="/admin/register" className="inline-flex justify-center border border-neutral-300 px-5 py-2.5 text-sm font-semibold">Register as Administrator</Link><Link href="/" className="mt-2 text-sm text-neutral-600 underline">Return to storefront</Link></div></section></main>;

  return <div className="min-h-screen bg-[#f5f5f5] text-neutral-950">
    <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-4"><button className="lg:hidden" aria-label="Open admin navigation" onClick={() => setMobileOpen(true)}><Menu size={20}/></button><Link href="/" className="text-lg font-black leading-none">MAILLOT<span className="block text-[10px] font-bold text-[#b4830b]">STORE</span></Link><span className="hidden border-l border-neutral-200 pl-4 text-xs font-semibold text-neutral-500 sm:block">ADMINISTRATION</span></div>
      <div className="flex items-center gap-3"><Link href="/" className="inline-flex items-center gap-1.5 border border-neutral-300 px-3 py-2 text-[11px] font-semibold hover:border-[#D4AF37] hover:text-[#8b6100]"><ExternalLink size={14}/><span className="hidden sm:inline">View storefront</span><span className="sm:hidden">Store</span></Link><Link href="/account/notifications" aria-label="Notifications" className="text-neutral-600"><Bell size={18}/></Link><div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-full bg-neutral-900 text-xs font-bold text-white">{user?.email.slice(0,1).toUpperCase()}</span><span className="hidden text-xs sm:block">{user?.email}<small className="block text-[10px] text-neutral-500">{role}</small></span><ChevronDown size={13}/></div></div>
    </header>
    <aside className="fixed bottom-0 left-0 top-16 z-20 hidden w-[230px] flex-col bg-[#080808] lg:flex"><p className="px-4 pb-3 pt-5 text-[10px] font-extrabold uppercase tracking-widest text-[#D4AF37]">ADMINISTRATION</p><nav className="flex flex-1 flex-col overflow-y-auto">{links}</nav></aside>
    {mobileOpen && <div className="fixed inset-0 z-50 bg-black/60 lg:hidden"><div className="flex h-full w-[min(300px,85vw)] flex-col bg-[#080808] p-3"><div className="flex items-center justify-between px-2 py-3"><span className="text-[10px] font-extrabold tracking-widest text-[#D4AF37]">ADMINISTRATION</span><button aria-label="Close navigation" onClick={() => setMobileOpen(false)}><X className="text-white"/></button></div><nav className="flex flex-1 flex-col overflow-y-auto">{links}</nav></div></div>}
    <main className="min-h-screen px-4 pb-10 pt-20 sm:px-6 lg:ml-[230px] lg:px-8">{children}</main>
  </div>;
}
