import {
  Headphones,
  ShieldCheck,
  Truck,
} from "lucide-react";

const supportItems = [
  {
    icon: ShieldCheck,
    title: "Secure Payment",
    description:
      "Your payment is safe and encrypted",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description:
      "We deliver to your doorstep",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description:
      "We're here to help you anytime",
  },
];

export function CartSupport() {
  return (
    <div className="mt-4 rounded-[10px] border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="space-y-4">
        {supportItems.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="flex items-center gap-3"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-50">
                <Icon
                  size={20}
                  strokeWidth={1.7}
                />
              </div>

              <div>
                <h3 className="text-[11px] font-bold">
                  {item.title}
                </h3>

                <p className="mt-0.5 text-[9px] text-neutral-600">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}