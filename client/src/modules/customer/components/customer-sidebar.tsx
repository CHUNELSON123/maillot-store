"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navigation = [
  { label: "Dashboard", href: "/account" },
  { label: "My Orders", href: "/account/orders" },
  { label: "Track Order", href: "/account/track-order" },
  { label: "Profile", href: "/account/profile" },
  { label: "Addresses", href: "/account/addresses" },
  { label: "Notifications", href: "/account/notifications" },
];

export function CustomerSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/account") {
      return pathname === "/account";
    }

    if (href === "/account/track-order") {
      return pathname.startsWith("/account/track-order");
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  };

  const activeItem =
    navigation.find((item) => isActive(item.href)) ??
    navigation[0];

  return (
    <aside className="w-full bg-white lg:w-64 lg:shrink-0 lg:border-r lg:border-neutral-200">
      {/* Mobile navigation */}
      <div className="border-b border-neutral-200 p-4 lg:hidden">
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="flex h-12 w-full items-center justify-between rounded-md border border-neutral-300 bg-white px-4 text-left"
          aria-expanded={isOpen}
        >
          <div>
            <p className="text-xs text-neutral-500">
              MY ACCOUNT
            </p>

            <p className="mt-1 text-sm font-semibold text-neutral-900">
              {activeItem.label}
            </p>
          </div>

          <span
            className={`text-lg transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            ▼
          </span>
        </button>

        {isOpen && (
          <nav className="mt-2 overflow-hidden rounded-md border border-neutral-200 bg-white">
            {navigation.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`block border-b border-neutral-100 px-4 py-3 text-sm font-medium last:border-b-0 ${
                    active
                      ? "bg-[#D4AF37] text-white"
                      : "text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            <button
              type="button"
              className="block w-full px-4 py-3 text-left text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              Logout
            </button>
          </nav>
        )}
      </div>

      {/* Desktop navigation */}
      <div className="hidden p-6 lg:block">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-md px-4 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-[#D4AF37] text-white"
                    : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          className="mt-8 w-full rounded-md px-4 py-3 text-left text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}