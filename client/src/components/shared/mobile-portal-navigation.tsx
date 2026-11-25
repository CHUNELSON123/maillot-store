'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { Ellipsis, LogOut, X, type LucideIcon } from 'lucide-react';

export type MobilePortalItem = { label: string; shortLabel?: string; href: string; icon: LucideIcon; exact?: boolean };

const subscribeToClient = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function MobilePortalNavigation({ primary, more, onLogout }: { primary: MobilePortalItem[]; more: MobilePortalItem[]; onLogout: () => void }) {
  const pathname = usePathname();
  const isClient = useSyncExternalStore(subscribeToClient, getClientSnapshot, getServerSnapshot);
  const [open, setOpen] = useState(false);
  const active = (item: MobilePortalItem) => item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);
  if (!isClient) return null;

  return createPortal(<div className="lg:hidden">
    {open && <><button type="button" aria-label="Close more navigation" onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-black/35"/><div id="mobile-portal-more" className="fixed inset-x-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-50 max-h-[65vh] overflow-y-auto rounded-xl border border-neutral-200 bg-white p-3 shadow-xl"><div className="mb-1 flex items-center justify-between px-2 py-2"><h2 className="text-sm font-bold">More</h2><button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="rounded p-1 text-neutral-600"><X size={19}/></button></div><nav aria-label="More navigation" className="space-y-1">{more.map((item) => <Link key={item.href} href={item.href} onClick={() => setOpen(false)} aria-current={active(item) ? 'page' : undefined} className={`flex min-h-11 items-center gap-3 rounded-md px-3 text-sm ${active(item) ? 'bg-amber-50 font-semibold text-[#956600]' : 'text-neutral-700 hover:bg-neutral-50'}`}><item.icon size={18}/>{item.label}</Link>)}<button type="button" onClick={() => { setOpen(false); onLogout(); }} className="flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-left text-sm text-neutral-700 hover:bg-neutral-50"><LogOut size={18}/>Sign out</button></nav></div></>}
    <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200 bg-white shadow-[0_-3px_12px_rgba(0,0,0,0.06)]" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}><div className="mx-auto grid h-[68px] max-w-xl grid-cols-5">{primary.map((item) => <Link key={item.href} href={item.href} onClick={() => setOpen(false)} aria-current={active(item) ? 'page' : undefined} className={`flex min-w-0 flex-col items-center justify-center gap-1 px-1 text-center text-[10px] font-semibold leading-tight ${active(item) ? 'text-[#a97100]' : 'text-neutral-600'}`}><item.icon size={19} strokeWidth={active(item) ? 2.4 : 1.8}/><span className="max-w-full truncate">{item.shortLabel ?? item.label}</span></Link>)}<button type="button" aria-expanded={open} aria-controls="mobile-portal-more" onClick={() => setOpen((value) => !value)} className={`flex flex-col items-center justify-center gap-1 text-[10px] font-semibold ${open || more.some(active) ? 'text-[#a97100]' : 'text-neutral-600'}`}><Ellipsis size={20}/><span>More</span></button></div></nav>
  </div>, document.body);
}
