import { CustomerLayout } from "@/modules/customer/components/customer-layout";
import { OrderDetails } from "@/modules/customer/components/order-details";

interface OrderPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function OrderPage({
  params,
}: OrderPageProps) {
  const { id } = await params;

  return (
    <CustomerLayout>
      <section>
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-neutral-900">
            Order Details
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            View the details of your order.
          </p>
        </div>

        <OrderDetails orderId={id} />
      </section>
    </CustomerLayout>
  );
}