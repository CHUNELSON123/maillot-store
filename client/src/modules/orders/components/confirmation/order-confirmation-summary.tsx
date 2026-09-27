import Image from "next/image";

type ConfirmationItem = {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
  };
  variant: {
    id: string;
    size: string | null;
    color: string | null;
    sku: string;
  } | null;
  imageUrl: string | null;
  quantity: number;
};

type Props = {
  items: ConfirmationItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
};

function resolveImageUrl(imageUrl: string | null) {
  if (!imageUrl) {
    return null;
  }

  if (imageUrl.startsWith("http")) {
    return imageUrl;
  }

  return imageUrl;
}

export function OrderConfirmationSummary({
  items,
  subtotal,
  deliveryFee,
  total,
}: Props) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-5 sm:p-6">
      <h2 className="text-lg font-semibold">
        Order Summary
      </h2>

      <div className="mt-5 space-y-5">
        {items.map((item) => {
          const imageUrl = resolveImageUrl(item.imageUrl);

          return (
            <div
              key={item.id}
              className="flex gap-3 border-b border-neutral-100 pb-5"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-neutral-100">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={item.product.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
                    No image
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-neutral-900">
                  {item.product.name}
                </p>

                {item.variant && (
                  <p className="mt-1 text-xs text-neutral-500">
                    {[
                      item.variant.size &&
                        `Size: ${item.variant.size}`,
                      item.variant.color &&
                        `Color: ${item.variant.color}`,
                    ]
                      .filter(Boolean)
                      .join(" • ")}
                  </p>
                )}

                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="text-xs text-neutral-500">
                    Qty: {item.quantity}
                  </span>

                  <span className="text-sm font-medium">
                    {item.product.price.toLocaleString()} FCFA
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-neutral-500">
            Subtotal
          </span>

          <span className="font-medium">
            {subtotal.toLocaleString()} FCFA
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-neutral-500">
            Delivery
          </span>

          <span className="font-medium">
            {deliveryFee.toLocaleString()} FCFA
          </span>
        </div>

        <div className="border-t border-neutral-200 pt-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold">
              Total
            </span>

            <span className="text-lg font-semibold">
              {total.toLocaleString()} FCFA
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}