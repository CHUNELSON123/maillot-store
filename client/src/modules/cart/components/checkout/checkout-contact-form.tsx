"use client";

import { UserRound } from "lucide-react";

type Props = {
  fullName: string;
  phone: string;
  email: string;
  onFullNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onEmailChange: (value: string) => void;
};

export function CheckoutContactForm({
  fullName,
  phone,
  email,
  onFullNameChange,
  onPhoneChange,
  onEmailChange,
}: Props) {
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
            value={fullName}
            onChange={(event) =>
              onFullNameChange(event.target.value)
            }
            placeholder="John Doe"
            className="h-8 w-full rounded-[4px] border border-neutral-300 px-3 text-[11px] outline-none transition focus:border-[#D4AF37]"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-[10px] font-semibold">
            Phone Number <span className="text-red-500">*</span>
          </span>

          <input
            type="tel"
            value={phone}
            onChange={(event) =>
              onPhoneChange(event.target.value)
            }
            placeholder="670 12 34 56"
            className="h-8 w-full rounded-[4px] border border-neutral-300 px-3 text-[11px] outline-none transition focus:border-[#D4AF37]"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-[10px] font-semibold">
            Email Address <span className="text-red-500">*</span>
          </span>

          <input
            type="email"
            value={email}
            onChange={(event) =>
              onEmailChange(event.target.value)
            }
            placeholder="john.doe@email.com"
            className="h-8 w-full rounded-[4px] border border-neutral-300 px-3 text-[11px] outline-none transition focus:border-[#D4AF37]"
          />
        </label>
      </div>
    </section>
  );
}