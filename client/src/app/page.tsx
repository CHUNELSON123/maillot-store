import { HomePageContent } from "@/modules/catalogue/components/home/home-page-content";
import { CustomerLayout } from "@/modules/customer/components/customer-layout";

export default function Home() {
  return (
    <CustomerLayout>
      <HomePageContent />
    </CustomerLayout>
  );
}