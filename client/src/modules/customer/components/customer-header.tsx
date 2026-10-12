"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  ShoppingCart,
  UserRound,
  ChevronDown,
  X,
  Heart,
} from "lucide-react";

import { useWishlist } from "@/modules/wishlist/hooks/use-wishlist";
import { useCart } from "@/modules/cart/hooks/use-cart";

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

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="w-full overflow-x-hidden">
      {/* Announcement bar */}
      <div className="relative flex min-h-[23px] items-center justify-center bg-[#D4AF37] px-10 py-1 text-[8px] font-extrabold uppercase tracking-wide text-black sm:h-[24px] sm:px-12 sm:py-0 sm:text-[10px]">
        <div className="flex min-w-0 items-center justify-center gap-2 sm:gap-3">
          <span className="whitespace-nowrap">
            NEW ARRIVALS &amp; SPECIAL OFFERS
          </span>

          <span className="text-black/70">|</span>

          <span className="hidden whitespace-nowrap sm:inline">
            FREE DELIVERY ON ORDERS OVER 50,000 FCFA
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
            aria-label="Maillot Store home"
            className="relative flex h-[42px] w-[82px] shrink-0 items-center overflow-hidden sm:h-[47px] sm:w-[95px]"
          >
            <Image
              src="/maillotstore-logo.jpg"
              alt="Maillot Store"
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
            {/* Search */}
            <div className="flex h-[27px] w-[105px] min-w-0 items-center border border-neutral-700 bg-[#151515] px-2 sm:h-[29px] sm:w-[166px] sm:px-2.5">
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
            <Link
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
            </Link>

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
          </div>
        </div>

        {/* Mobile navigation */}
        <div className="border-t border-neutral-800 lg:hidden">
          <nav className="mx-auto flex max-w-[1200px] gap-5 overflow-x-auto px-3 py-2.5 scrollbar-none sm:gap-6 sm:px-8">
            {navItems.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`shrink-0 text-[8px] font-extrabold uppercase transition sm:text-[9px] ${
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
        </div>
      </div>
    </header>
  );
}