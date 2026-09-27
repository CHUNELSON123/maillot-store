import { CustomerLayout } from "@/modules/customer/components/customer-layout";
import { CustomerSidebar } from "@/modules/customer/components/customer-sidebar";
import { NewsletterSection } from "@/components/shared/newsletter-section";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CustomerLayout>
      <div className="min-h-screen bg-white text-neutral-950">
        <div className="mx-auto flex max-w-[1200px] flex-col lg:flex-row">
          <CustomerSidebar />

          <main className="min-w-0 flex-1 px-5 py-6 sm:px-8 lg:px-8">
            {children}
          </main>
        </div>
      </div>

      <NewsletterSection />
    </CustomerLayout>
  );
}