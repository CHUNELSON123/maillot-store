"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { authStorage } from "@/lib/auth/auth-storage";
import { apiClient } from "@/services/api/api-client";
import { ApiError } from "@/services/api/api-error";
import { CustomerSidebar } from "./customer-sidebar";

type AccessState = "loading" | "guest" | "no-customer" | "ready" | "error";

export function AccountAccess({ children }: { children: React.ReactNode }) {
  const [access, setAccess] = useState<AccessState>("loading");
  const pathname = usePathname();
  const [retry, setRetry] = useState(0);
  const checkAccess = useCallback(async (token: string): Promise<AccessState> => {
    try {
      await apiClient("/customers/profile", { method: "GET", token });
      return "ready";
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 401) return "guest";
      if (error instanceof ApiError && (error.statusCode === 403 || error.statusCode === 404)) return "no-customer";
      return "error";
    }
  }, []);

  useEffect(() => {
    let active = true;
    let generation = 0;
    const refresh = () => {
      const current = ++generation;
      const token = authStorage.getStorefrontToken();
      if (!token) {
        setAccess(authStorage.getToken() ? "no-customer" : "guest");
        return;
      }
      setAccess("loading");
      void checkAccess(token).then((next) => {
        if (!active || current !== generation) return;
        if (token !== authStorage.getStorefrontToken()) { refresh(); return; }
        setAccess(next);
      });
    };
    refresh();
    window.addEventListener("maillot-auth-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      active = false;
      window.removeEventListener("maillot-auth-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [checkAccess, retry]);

  if (access === "ready") {
    return <div className="mx-auto flex max-w-[1200px] flex-col border-x border-neutral-100 lg:min-h-[510px] lg:flex-row">
      <CustomerSidebar />
      <main className="min-w-0 flex-1 px-4 pb-24 pt-5 sm:px-6 sm:pt-7 lg:px-8 lg:pb-7">{children}</main>
    </div>;
  }

  const returnUrl = encodeURIComponent(pathname || "/account");
  return <main className="mx-auto flex min-h-[510px] max-w-[1200px] items-start justify-center px-4 py-12 sm:px-6">
    {access === "loading" ? <p role="status" className="text-sm text-neutral-500">Loading your account...</p> : access === "error" ?
      <section className="w-full max-w-lg border border-neutral-200 bg-white p-8 text-center">
        <h1 className="text-xl font-bold">We couldn&apos;t load your account</h1>
        <p className="mt-2 text-sm text-neutral-600">Please check your connection and try again.</p>
        <button type="button" onClick={() => setRetry((value) => value + 1)} className="mt-5 h-10 bg-[#d28a00] px-5 text-xs font-bold text-white">Try again</button>
      </section> :
      <section className="w-full max-w-lg border border-neutral-200 bg-white p-8 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#a36a00]">Customer account</p>
        <h1 className="mt-2 text-xl font-bold">Sign in or create an account</h1>
        <p className="mt-2 text-sm leading-6 text-neutral-600">{access === "no-customer" ? "Your current sign-in does not have access to a customer account. Sign in with a customer account or create one to manage your orders and addresses." : "Sign in or create a customer account to view your orders, manage addresses and update your profile."}</p>
        <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
          <Link href={`/login?returnUrl=${returnUrl}`} className="inline-flex h-10 items-center justify-center bg-[#d28a00] px-5 text-xs font-bold text-white hover:bg-[#b87700]">Sign in</Link>
          <Link href={`/register?returnUrl=${returnUrl}`} className="inline-flex h-10 items-center justify-center border border-neutral-300 px-5 text-xs font-bold text-neutral-800 hover:border-[#d28a00]">Create account</Link>
        </div>
      </section>}
  </main>;
}
