"use client";

import { UserRound } from "lucide-react";

export function CheckoutContactForm() {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D4A017] text-white">
          <UserRound size={17} />
        </span>

        <h2 className="text-[15px] font-extrabold uppercase">
          1. CONTACT INFORMATION
        </h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-[10px] font-semibold">
            Full Name <span className="text-red-500">*</span>
          </span>

          <input
            type="text"
            placeholder="John Doe"
            className="h-8 w-full rounded-[4px] border border-neutral-300 px-3 text-[11px] outline-none transition focus:border-[#D4AF37]"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-[10px] font-semibold">
            Phone Number{" "}
            <span className="text-red-500">*</span>
          </span>

          <input
            type="tel"
            placeholder="670 12 34 56"
            className="h-8 w-full rounded-[4px] border border-neutral-300 px-3 text-[11px] outline-none transition focus:border-[#D4AF37]"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-[10px] font-semibold">
            Email Address{" "}
            <span className="text-red-500">*</span>
          </span>

          <input
            type="email"
            placeholder="john.doe@email.com"
            className="h-8 w-full rounded-[4px] border border-neutral-300 px-3 text-[11px] outline-none transition focus:border-[#D4AF37]"
          />
        </label>
      </div>
    </section>
  );
}