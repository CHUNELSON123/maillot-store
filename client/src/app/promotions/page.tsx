import { CustomerLayout } from "@/components/layout/customer-layout";
import { PromotionsPageContent } from "@/modules/catalogue/components/promotions/promotions-page-content";

export default function PromotionsPage() {
  return (
    <CustomerLayout>
      <PromotionsPageContent />
    </CustomerLayout>
  );
}