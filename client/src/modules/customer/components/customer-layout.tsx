import { ReactNode } from "react";
import { CustomerSidebar } from "./customer-sidebar";

interface CustomerLayoutProps {
  children: ReactNode;
}

export function CustomerLayout({
  children,
}: CustomerLayoutProps) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col lg:flex-row">
        <CustomerSidebar />

        <main className="min-w-0 flex-1 p-6 sm:p-8 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}