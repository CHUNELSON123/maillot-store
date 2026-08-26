import { CustomerLayout } from "@/modules/customer/components/customer-layout";
import { CustomerProfile } from "@/modules/customer/components/customer-profile";

export default function ProfilePage() {
  return (
    <CustomerLayout>
      <CustomerProfile />
    </CustomerLayout>
  );
}