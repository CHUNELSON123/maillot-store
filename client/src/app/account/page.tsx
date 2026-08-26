import { CustomerLayout } from "@/modules/customer/components/customer-layout";
import { AccountDashboard } from "@/modules/customer/components/account-dashboard";

export default function AccountPage() {
  return (
    <CustomerLayout>
      <AccountDashboard />
    </CustomerLayout>
  );
}