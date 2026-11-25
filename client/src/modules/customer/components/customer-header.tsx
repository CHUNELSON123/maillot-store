"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Search,
  ShoppingCart,
  UserRound,
  ChevronDown,
  X,
  Heart,
  LayoutDashboard,
  Menu,
} from "lucide-react";

import { useWishlist } from "@/modules/wishlist/hooks/use-wishlist";
import { useCart } from "@/modules/cart/hooks/use-cart";
import { useInfluencerAccess } from "@/modules/influencers/hooks/use-influencer-access";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { cmsService } from "@/modules/cms/services/cms.service";

const navItems = [
  { name: "HOME", href: "/" },
  { name: "SHOP", href: "/shop" },
  { name: "CATEGORIES", href: "/categories", dropdown: true },
  { name: "PROMOTIONS", href: "/promotions" },
  { name: "ABOUT US", href: "/about" },
  { name: "CONTACT", href: "/contact" },
];

export function CustomerHeader() {
  const pathname = usePathname();
  const { itemCount: wishlistCount, isReady: wishlistReady } = useWishlist();
  const { itemCount: cartCount } = useCart();
  const canOpenInfluencerPortal = useInfluencerAccess();
  const { user, isAuthenticated } = useAuth();
  const inCustomerAccount = isAuthenticated && (user?.roleName === 'Customer' || user?.roleName === 'Influencer') && (pathname === '/account' || pathname.startsWith('/account/'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setMobileMenuOpen(false); };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [mobileMenuOpen]);
  const canOpenAdminPortal = isAuthenticated && (user?.roleName === "Administrator" || user?.roleName === "Staff");
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(50000);
  const [siteName, setSiteName] = useState("Maillot Store");
  const [siteLogoUrl, setSiteLogoUrl] = useState("/maillotstore-logo.jpg");
  const [deliveryEnabledForBanner, setDeliveryEnabledForBanner] = useState(true);
  useEffect(() => {
    let mounted = true;
    void cmsService.getPublicContent().then((content) => {
      const value = Number(content["store.free_delivery_threshold"]);
      if (mounted && Number.isFinite(value) && value >= 0) setFreeDeliveryThreshold(value);
      if (mounted && content["store.delivery_enabled"] === "false") setDeliveryEnabledForBanner(false);
      if (mounted && content["store.site_name"]) setSiteName(content["store.site_name"]);
      if (mounted && content["store.site_logo_url"]) {
        const path = content["store.site_logo_url"];
        const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/v1").replace(/\/v1\/?$/, "");
        setSiteLogoUrl(path.startsWith("/") ? `${apiBase}${path}` : path);
      }
      if (mounted && content["store.site_favicon_url"] && typeof document !== "undefined") {
        const path = content["store.site_favicon_url"];
        const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/v1").replace(/\/v1\/?$/, "");
        let favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
        if (!favicon) { favicon = document.createElement("link"); favicon.rel = "icon"; document.head.appendChild(favicon); }
        favicon.href = path.startsWith("/") ? `${apiBase}${path}` : path;
      }
    }).catch(() => undefined);
    return () => { mounted = false; };
  }, []);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Announcement bar */}
      <div className="relative flex min-h-[23px] items-center justify-center bg-[#D4AF37] px-10 py-1 text-[8px] font-extrabold uppercase tracking-wide text-black sm:h-[24px] sm:px-12 sm:py-0 sm:text-[10px]">
        <div className="flex min-w-0 items-center justify-center gap-2 sm:gap-3">
          <span className="whitespace-nowrap">
            NEW ARRIVALS &amp; SPECIAL OFFERS
          </span>

          <span className="text-black/70">|</span>

          <span className="hidden whitespace-nowrap sm:inline">
            {!deliveryEnabledForBanner ? "STORE PICKUP AVAILABLE" : freeDeliveryThreshold > 0 ? `FREE DELIVERY ON ORDERS OVER ${freeDeliveryThreshold.toLocaleString()} FCFA` : "DELIVERY FEES APPLY AT CHECKOUT"}
          </span>

          <span className="hidden h-[19px] w-px bg-black/30 sm:block" />

          <Link
            href="/shop"
            className="inline-flex h-[18px] shrink-0 items-center justify-center bg-black px-2.5 text-[7px] font-extrabold text-[#D4AF37] transition hover:bg-neutral-800 sm:h-[19px] sm:px-4 sm:text-[9px]"
          >
            SHOP NOW
            <span className="ml-1 text-[10px] leading-none sm:text-[12px]">
              →
            </span>
          </Link>
        </div>

        <button
          type="button"
          aria-label="Close announcement"
          className="absolute right-1.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-black transition hover:opacity-70 sm:right-5"
        >
          <X size={14} strokeWidth={2} />
        </button>
      </div>

      {/* Main navigation */}
      <div className="border-b border-neutral-800 bg-[#070707] text-white">
        <div className="mx-auto flex min-h-[65px] max-w-[1200px] items-center gap-3 px-3 sm:h-[65px] sm:px-8">
          {/* Logo */}
          <Link
            href="/"
            aria-label={`${siteName} home`}
            className="relative flex h-[42px] w-[82px] shrink-0 items-center overflow-hidden sm:h-[47px] sm:w-[95px]"
          >
            <Image
              src={siteLogoUrl}
              unoptimized
              alt={siteName}
              fill
              priority
              sizes="(max-width: 640px) 82px, 95px"
              className="object-contain mix-blend-screen"
            />
          </Link>

          {/* Desktop navigation */}
          <nav className="ml-auto hidden h-full items-center lg:flex">
            {navItems.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative flex h-full items-center gap-1 px-[17px] text-[10px] font-extrabold uppercase transition ${
                    active
                      ? "text-[#D4AF37]"
                      : "text-white hover:text-[#D4AF37]"
                  }`}
                >
                  {item.name}

                  {item.dropdown && (
                    <ChevronDown size={12} strokeWidth={2} />
                  )}

                  {active && (
                    <span className="absolute bottom-[8px] left-1/2 h-[2px] w-[31px] -translate-x-1/2 bg-[#D4AF37]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-4 lg:ml-5">
            {canOpenInfluencerPortal && (
              <Link
                href="/influencer/portal/dashboard"
                aria-label="Influencer dashboard"
                className={`flex shrink-0 items-center gap-1.5 transition ${
                  isActive("/influencer/portal")
                    ? "text-[#D4AF37]"
                    : "text-white hover:text-[#D4AF37]"
                }`}
              >
                <LayoutDashboard size={18} strokeWidth={1.7} />
                <span className="hidden text-[10px] font-semibold sm:inline">Dashboard</span>
              </Link>
            )}

            {canOpenAdminPortal && (
              <Link
                href="/admin/dashboard"
                aria-label="Administrator dashboard"
                className={`flex shrink-0 items-center gap-1.5 transition ${isActive("/admin") ? "text-[#D4AF37]" : "text-white hover:text-[#D4AF37]"}`}
              >
                <LayoutDashboard size={18} strokeWidth={1.7} />
                <span className="hidden text-[10px] font-semibold sm:inline">Admin</span>
              </Link>
            )}

            {/* Search */}
            <div className="hidden h-[27px] w-[105px] min-w-0 items-center border border-neutral-700 bg-[#151515] px-2 sm:flex sm:h-[29px] sm:w-[166px] sm:px-2.5">
              <input
                type="text"
                placeholder="Search..."
                aria-label="Search products"
                className="min-w-0 flex-1 bg-transparent text-[8px] text-white outline-none placeholder:text-neutral-500 sm:text-[9px]"
              />

              <Search
                size={15}
                strokeWidth={1.8}
                className="shrink-0 text-white sm:size-[17px]"
              />
            </div>

            {/* Account */}
            {!canOpenAdminPortal && <Link
              href="/account"
              aria-label="Account"
              className={`flex shrink-0 items-center gap-1.5 transition ${
                isActive("/account")
                  ? "text-[#D4AF37]"
                  : "text-white hover:text-[#D4AF37]"
              }`}
            >
              <UserRound size={18} strokeWidth={1.7} />

              <span className="hidden text-[10px] font-semibold sm:inline">
                Account
              </span>
            </Link>}

            {/* Wishlist */}
            <Link
              href="/wishlist"
              aria-label={`Wishlist${wishlistReady ? `, ${wishlistCount} items` : ""}`}
              aria-current={isActive("/wishlist") ? "page" : undefined}
              className={`relative flex shrink-0 items-center gap-1.5 transition ${
                isActive("/wishlist")
                  ? "text-[#D4AF37]"
                  : "text-white hover:text-[#D4AF37]"
              }`}
            >
              <Heart
                size={20}
                strokeWidth={1.7}
                className={
                  isActive("/wishlist") ? "fill-[#D4AF37]" : ""
                }
              />

              <span className="hidden text-[10px] font-semibold sm:inline">
                Wishlist
              </span>

              {wishlistReady && wishlistCount > 0 && (
                <span className="absolute -right-[5px] -top-[7px] flex h-[14px] min-w-[14px] items-center justify-center rounded-full bg-[#D4AF37] px-1 text-[7px] font-extrabold leading-none text-black">
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              aria-label={`Cart, ${cartCount} items`}
              className={`relative flex shrink-0 items-center gap-1.5 transition ${
                isActive("/cart")
                  ? "text-[#D4AF37]"
                  : "text-white hover:text-[#D4AF37]"
              }`}
            >
              <ShoppingCart size={20} strokeWidth={1.7} />

              <span className="hidden text-[10px] font-semibold sm:inline">
                Cart
              </span>

              {cartCount > 0 && (
                <span className="absolute -right-[5px] -top-[7px] flex h-[14px] min-w-[14px] items-center justify-center rounded-full bg-[#D4AF37] px-1 text-[7px] font-extrabold leading-none text-black">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
            {!inCustomerAccount && <button type="button" aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileMenuOpen} aria-controls="storefront-mobile-menu" onClick={() => setMobileMenuOpen((open) => !open)} className="grid h-9 w-9 shrink-0 place-items-center text-white hover:text-[#D4AF37] lg:hidden">{mobileMenuOpen ? <X size={22}/> : <Menu size={22}/>}</button>}
          </div>
        </div>

        {/* Mobile navigation */}
        {mobileMenuOpen && !inCustomerAccount && <div id="storefront-mobile-menu" className="absolute inset-x-0 top-full z-50 max-h-[calc(100vh-90px)] overflow-y-auto border-t border-neutral-700 bg-[#070707] px-3 py-3 shadow-xl lg:hidden">
          <div className="mb-3 flex h-10 items-center border border-neutral-700 bg-[#151515] px-3 sm:hidden"><input type="text" placeholder="Search..." aria-label="Search products" className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-neutral-500"/><Search size={17} strokeWidth={1.8}/></div>
          <nav aria-label="Store navigation" className="mx-auto grid max-w-[1200px] gap-1 sm:px-5">
            {navItems.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-11 items-center rounded px-3 text-xs font-extrabold uppercase transition ${
                    active
                      ? "text-[#D4AF37]"
                      : "text-white hover:text-[#D4AF37]"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>}
      </div>
    </header>
  );
}
