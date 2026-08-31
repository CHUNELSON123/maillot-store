import { CustomerLayout } from "@/modules/customer/components/customer-layout";
import { CategoriesPageContent } from "@/modules/catalogue/components/categories/categories-page-content";

export default function CategoriesPage() {
  return (
    <CustomerLayout>
      <CategoriesPageContent />
    </CustomerLayout>
  );
}