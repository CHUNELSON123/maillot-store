import { CustomerLayout } from "@/modules/customer/components/customer-layout";
import { AddressList } from "@/modules/customer/components/address-list";

export default function AddressesPage() {
  return (
    <CustomerLayout>
      <section>
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-neutral-900">
            My Addresses
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            Manage your saved delivery addresses.
          </p>
        </div>

        <AddressList />
      </section>
    </CustomerLayout>
  );
}