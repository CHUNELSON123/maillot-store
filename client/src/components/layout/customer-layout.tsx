import { ReactNode } from "react";

import { CustomerHeader } from "@/modules/customer/components/customer-header";
import { CustomerFooter } from "@/modules/customer/components/customer-footer";

type CustomerLayoutProps = {
  children: ReactNode;
};

export function CustomerLayout({
  children,
}: CustomerLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <CustomerHeader />

      {children}

      <CustomerFooter />
    </div>
  );
}