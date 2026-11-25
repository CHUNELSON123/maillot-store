import { AddressList } from "@/modules/customer/components/address-list";

export default function AddressesPage() {
  return (
    <section>
      <div className="mb-8">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-xl font-bold text-neutral-900">
          My Addresses
        </h1>

        <p className="mt-1 text-xs text-neutral-500">
          Manage your saved delivery addresses.
        </p></div></div>
      </div>

      <AddressList />
    </section>
  );
}
