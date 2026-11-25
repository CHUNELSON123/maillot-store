"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, MapPin, Package, Search, UserRound, LogOut } from "lucide-react";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { MobilePortalNavigation } from "@/components/shared/mobile-portal-navigation";

const navigation = [
  { label: "Dashboard", href: "/account", Icon: LayoutDashboard },
  { label: "My Orders", href: "/account/orders", Icon: Package },
  { label: "Track Order", href: "/account/track-order", Icon: Search },
  { label: "Profile", href: "/account/profile", Icon: UserRound },
  { label: "Addresses", href: "/account/addresses", Icon: MapPin },
];

export function CustomerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const isActive = (href: string) => href === "/account"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);

  const links = <>
    {navigation.map(({ label, href, Icon }) => {
      const active = isActive(href);
      return <Link key={href} href={href} aria-current={active ? "page" : undefined}
        className={`flex h-10 items-center gap-3 border-l-[3px] px-3 text-xs font-medium transition ${active ? "border-[#d28a00] bg-[#fff8e9] text-[#925f00]" : "border-transparent text-neutral-600 hover:bg-neutral-50"}`}>
        <Icon size={15} strokeWidth={1.8}/>{label}
      </Link>;
    })}
    <button type="button" onClick={() => { logout(); router.push("/login"); }} className="flex h-10 w-full items-center gap-3 border-l-[3px] border-transparent px-3 text-left text-xs font-medium text-neutral-600 hover:bg-neutral-50">
      <LogOut size={15} strokeWidth={1.8}/>Logout
    </button>
  </>;

  return <>
    <MobilePortalNavigation primary={navigation.slice(0, 4).map(({ Icon, ...item }, index) => ({ ...item, icon: Icon, exact: index === 0, shortLabel: ['Dashboard', 'Orders', 'Track', 'Profile'][index] }))} more={navigation.slice(4).map(({ Icon, ...item }) => ({ ...item, icon: Icon }))} onLogout={() => { logout(); router.push('/login'); }}/>
    <aside className="hidden w-[210px] shrink-0 border-r border-neutral-200 bg-white lg:block">
      <div className="sticky top-0 px-4 py-7">
        <h2 className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-400">My Account</h2>
        <nav className="space-y-1">{links}</nav>
      </div>
    </aside>
  </>;
}
