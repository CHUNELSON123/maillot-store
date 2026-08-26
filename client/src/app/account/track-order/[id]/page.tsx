import { CustomerLayout } from "@/modules/customer/components/customer-layout";
import { OrderDetails } from "@/modules/customer/components/order-details";

interface TrackOrderPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TrackOrderPage({
  params,
}: TrackOrderPageProps) {
  const { id } = await params;

  return (
    <CustomerLayout>
      <section>
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-neutral-900">
            Track Order
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            Check the current status of your order.
          </p>
        </div>

        <OrderDetails
          orderId={id}
          tracking
        />
      </section>
    </CustomerLayout>
  );
}