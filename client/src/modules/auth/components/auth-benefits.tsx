import {
  Headphones,
  LockKeyhole,
  Truck,
} from "lucide-react";

const benefits = [
  {
    title: "Secure Login",
    description: "Your data is safe and protected",
    icon: LockKeyhole,
  },
  {
    title: "24/7 Support",
    description: "We're here to help you anytime",
    icon: Headphones,
  },
  {
    title: "Fast Delivery",
    description: "We deliver to your doorstep",
    icon: Truck,
  },
];

export function AuthBenefits() {
  return (
    <div className="border-t border-neutral-200 px-6 py-6 sm:px-10 lg:px-16">
      <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-3">
        {benefits.map((benefit) => {
          const Icon = benefit.icon;

          return (
            <div
              key={benefit.title}
              className="flex items-center gap-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/40">
                <Icon
                  size={20}
                  className="text-[#A77D00]"
                />
              </div>

              <div>
                <p className="text-sm font-semibold text-neutral-950">
                  {benefit.title}
                </p>

                <p className="text-xs text-neutral-600">
                  {benefit.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}