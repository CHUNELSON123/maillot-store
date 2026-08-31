"use client";

import Link from "next/link";
import {
  Megaphone,
  ShoppingCart,
  CircleDollarSign,
} from "lucide-react";

const steps = [
  {
    title: "SHARE PRODUCTS",
    icon: Megaphone,
  },
  {
    title: "GENERATE SALES",
    icon: ShoppingCart,
  },
  {
    title: "EARN COMMISSION",
    icon: CircleDollarSign,
  },
];

export function InfluencerSection() {
  return (
    <section className="relative min-w-0 overflow-hidden border border-[#D4AF37]/70 bg-[#080808]">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/influencer-bg.jpg')",
        }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/75" />

      {/* Content */}
      <div className="relative flex min-h-[175px] flex-col px-5 py-4 sm:min-h-[185px] sm:px-7 sm:py-5 lg:min-h-[190px] lg:px-8">
        {/* Main content */}
        <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-[190px_1fr] sm:gap-5">
          {/* Text */}
          <div className="min-w-0">
            <h2 className="text-[15px] font-black uppercase leading-[1.05] tracking-wide text-[#D4AF37] sm:text-[17px]">
              BECOME A
              <br />
              MAILLOT STORE
              <br />
              INFLUENCER
            </h2>

            <p className="mt-2 max-w-[190px] text-[9px] leading-[1.45] text-white sm:text-[10px]">
              Love sports? Turn your influence into rewards.
              Promote Maillot Store products and earn
              commissions from successful sales.
            </p>
          </div>

          {/* Steps */}
          <div className="flex min-w-0 items-center justify-center">
            <div className="flex w-full items-center justify-center gap-2 sm:gap-3 lg:gap-4">
              {steps.map((step, index) => {
                const Icon = step.icon;

                return (
                  <div
                    key={step.title}
                    className="flex min-w-0 flex-1 items-center justify-center"
                  >
                    <div className="flex min-w-0 flex-col items-center text-center">
                      <Icon
                        size={28}
                        strokeWidth={1.7}
                        className="shrink-0 text-[#D4AF37]"
                      />

                      <span className="mt-2 whitespace-nowrap text-[7px] font-extrabold uppercase text-white sm:text-[8px]">
                        {step.title}
                      </span>
                    </div>

                    {index < steps.length - 1 && (
                      <span className="mx-1 text-base text-[#D4AF37] sm:mx-2 sm:text-lg">
                        →
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-2 flex justify-center sm:justify-end">
          <Link
            href="/register"
            className="inline-flex h-7 items-center justify-center border border-[#D4AF37] px-5 text-[7px] font-extrabold uppercase tracking-wide text-white transition hover:bg-[#D4AF37] hover:text-black sm:h-8 sm:px-7 sm:text-[8px]"
          >
            BECOME AN INFLUENCER
          </Link>
        </div>
      </div>
    </section>
  );
}