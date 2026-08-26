import { CustomerLayout } from "@/modules/customer/components/customer-layout";
import { OrderList } from "@/modules/customer/components/order-list";

export default function OrdersPage() {
  return (
    <CustomerLayout>
      <section>
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-neutral-900">
            My Orders
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            View and manage your orders.
          </p>
        </div>

        <OrderList />
      </section>
    </CustomerLayout>
  );
}