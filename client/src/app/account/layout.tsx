import { CustomerLayout } from "@/modules/customer/components/customer-layout";
import { AccountAccess } from "@/modules/customer/components/account-access";
import { NewsletterSection } from "@/components/shared/newsletter-section";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CustomerLayout>
      <div className="min-h-[510px] bg-[#fafafa] text-neutral-950">
        <AccountAccess>{children}</AccountAccess>
      </div>

      <NewsletterSection />
    </CustomerLayout>
  );
}
