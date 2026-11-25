"use client";

import { ReactNode, useEffect, useState } from "react";

import { CustomerHeader } from "./customer-header";
import { CustomerFooter } from "./customer-footer";
import { cmsService } from "@/modules/cms/services/cms.service";
import { useAuth } from "@/modules/auth/hooks/use-auth";
import { usePathname } from "next/navigation";

type CustomerLayoutProps = {
  children: ReactNode;
};

export function CustomerLayout({
  children,
}: CustomerLayoutProps) {
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  useEffect(() => {
    let mounted = true;
    void cmsService.getPublicContent().then((content) => {
      if (mounted) setMaintenanceMode(content["store.maintenance_mode"] === "true");
    }).catch(() => undefined);
    return () => { mounted = false; };
  }, []);
  const maintenanceAccess = user?.roleName === "Administrator" || user?.roleName === "Staff";

  return (
    <div className={`min-h-screen bg-white ${isAuthenticated && (pathname === '/account' || pathname.startsWith('/account/')) ? 'pb-[calc(68px+env(safe-area-inset-bottom))] lg:pb-0' : ''}`}>
      <CustomerHeader />

      {maintenanceMode && !maintenanceAccess ? <main className="grid min-h-[55vh] place-items-center bg-neutral-50 px-5 py-12 text-center"><div className="max-w-md"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#a36a00]">Maillot Store</p><h1 className="mt-3 text-2xl font-black">We’ll be back soon</h1><p className="mt-2 text-sm leading-6 text-neutral-600">Our store is temporarily unavailable while we make updates. Please check back soon.</p></div></main> : children}

      <CustomerFooter />
    </div>
  );
}
