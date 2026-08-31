import {
  Headphones,
  LockKeyhole,
  ShieldCheck,
  Truck,
} from "lucide-react";

const benefits = [
  {
    title: "QUALITY PRODUCTS",
    description:
      "Carefully selected jerseys and merchandise for passionate fans.",
    icon: ShieldCheck,
  },
  {
    title: "SECURE PAYMENT",
    description:
      "Multiple secure payment options for a safe and smooth checkout.",
    icon: LockKeyhole,
  },
  {
    title: "RELIABLE DELIVERY",
    description:
      "Orders delivered through trusted and reliable delivery services.",
    icon: Truck,
  },
  {
    title: "CUSTOMER SUPPORT",
    description:
      "Our support team is here to help you whenever you need.",
    icon: Headphones,
  },
];

export function ShopBenefits() {
  return (
    <section className="bg-[#090909] px-5 py-1 sm:px-8 lg:px-10">
      <div className="relative mx-auto max-w-[1200px] border border-[#4a390d]">
        {/* Heading */}
        <div className="absolute left-1/2 top-0 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center gap-3 bg-[#090909] px-4 sm:gap-4 sm:px-5">
          <span className="h-px w-7 bg-[#D4AF37] sm:w-9" />

          <h2 className="whitespace-nowrap text-[13px] font-extrabold uppercase tracking-[0.08em] text-white sm:text-[15px]">
            WHY SHOP WITH MAILLOT STORE?
          </h2>

          <span className="h-px w-7 bg-[#D4AF37] sm:w-9" />
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;

            return (
              <div
                key={benefit.title}
                className={[
                  "flex min-h-[105px] items-center gap-4 px-5 py-5",
                  "border-[#3a3a3a]",
                  index < 3
                    ? "lg:border-r"
                    : "",
                  index === 0
                    ? "sm:border-r"
                    : "",
                  index === 2
                    ? "sm:border-r"
                    : "",
                  index < 2
                    ? "border-b sm:border-b-0"
                    : "",
                  index === 2
                    ? "sm:border-b lg:border-b-0"
                    : "",
                ].join(" ")}
              >
                {/* Icon */}
                <div className="flex w-[58px] shrink-0 items-center justify-center">
                  <Icon
                    size={42}
                    strokeWidth={1.5}
                    className="text-[#D4AF37]"
                  />
                </div>

                {/* Text */}
                <div className="min-w-0">
                  <h3 className="text-[10px] font-extrabold uppercase tracking-[0.05em] text-[#D4AF37] sm:text-[11px]">
                    {benefit.title}
                  </h3>

                  <p className="mt-1 max-w-[175px] text-[9px] leading-[1.45] text-neutral-300 sm:text-[10px]">
                    {benefit.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}