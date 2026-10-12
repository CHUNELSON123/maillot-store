
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  Headphones,
  LockKeyhole,
  ShieldCheck,
  Truck,
} from "lucide-react";

import { CustomerLayout } from "@/modules/customer/components/customer-layout";
import { NewsletterSection } from "@/components/shared/newsletter-section";

const trustFeatures = [
  {
    title: "100% Original",
    description: "We sell only authentic products.",
    Icon: ShieldCheck,
  },
  {
    title: "Secure Shopping",
    description: "Your data is safe with us.",
    Icon: LockKeyhole,
  },
  {
    title: "Fast Delivery",
    description: "Quick and reliable delivery to your door.",
    Icon: Truck,
  },
  {
    title: "Customer Support",
    description: "We're here to help you anytime.",
    Icon: Headphones,
  },
];

export default function AboutPage() {
  return (
    <CustomerLayout>
      <main className="bg-white text-neutral-950">
        <div className="mx-auto max-w-[1200px] px-4 pb-8 pt-4 sm:px-8 lg:px-5">
          <nav
            aria-label="Breadcrumb"
            className="mb-7 flex items-center gap-2 text-[10px] text-neutral-600"
          >
            <Link
              href="/"
              className="transition hover:text-[#b18b19]"
            >
              Home
            </Link>

            <span aria-hidden="true">›</span>

            <span className="font-medium text-neutral-950">
              About Us
            </span>
          </nav>

          <section className="grid items-center gap-7 md:grid-cols-[1fr_0.9fr] md:gap-10 lg:gap-14">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
                ABOUT MAILLOT STORE
              </h1>

              <p className="mt-2 text-sm font-medium text-neutral-800">
                Your Ultimate Destination for Sports Merchandise
              </p>

              <div className="mt-5 space-y-4 text-xs leading-6 text-neutral-700 sm:text-sm">
                <p>
                  Maillot Store was founded with a passion for football
                  and a mission to bring authentic, high-quality sports
                  merchandise closer to fans.
                </p>

                <p>
                  We offer a wide range of jerseys, training wear,
                  footwear, and accessories from the world&apos;s biggest
                  clubs and brands.
                </p>

                <p>
                  Our goal is simple: provide fans with original products,
                  excellent service, and a shopping experience they can trust.
                </p>
              </div>

              <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-neutral-800">
                <CheckCircle2
                  size={16}
                  className="shrink-0 text-[#D4AF37]"
                />
                <span>Made for fans. Driven by passion.</span>
              </div>
            </div>

            <div className="relative mx-auto aspect-[4/3] w-full max-w-[520px] overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 shadow-sm">
              <Image
                src="/about-maillot-store.png"
                alt="Maillot Store sports merchandise and jerseys"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 45vw"
                className="object-cover"
              />
            </div>
          </section>

          <section
            aria-label="Our customer commitments"
            className="mt-8 grid grid-cols-2 overflow-hidden rounded-lg border border-neutral-200 sm:grid-cols-4"
          >
            {trustFeatures.map(({ title, description, Icon }, index) => (
              <div
                key={title}
                className={`flex flex-col items-center px-3 py-5 text-center sm:px-4 ${
                  index > 0 ? "border-l border-neutral-200" : ""
                } ${
                  index === 2
                    ? "border-t border-neutral-200 sm:border-t-0"
                    : ""
                } ${
                  index === 3
                    ? "border-t border-neutral-200 sm:border-t-0"
                    : ""
                }`}
              >
                <Icon
                  size={25}
                  strokeWidth={1.7}
                  className="text-neutral-950"
                />

                <h2 className="mt-3 text-[10px] font-extrabold sm:text-xs">
                  {title}
                </h2>

                <p className="mt-1 max-w-[150px] text-[10px] leading-4 text-neutral-600">
                  {description}
                </p>
              </div>
            ))}
          </section>
        </div>

        <div className="[&_section]:mt-0">
          <NewsletterSection />
        </div>
      </main>
    </CustomerLayout>
  );
}
