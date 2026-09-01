"use client";

import Link from "next/link";
import { UserRound, X } from "lucide-react";

type CheckoutAccountPromptProps = {
  onContinueAsGuest: () => void;
  onClose: () => void;
};

export function CheckoutAccountPrompt({
  onContinueAsGuest,
  onClose,
}: CheckoutAccountPromptProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="relative w-full max-w-[430px] rounded-[8px] bg-white p-6 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-black"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D4AF37]/15 text-[#D4AF37]">
            <UserRound size={22} />
          </div>

          <h2 className="mt-4 text-[18px] font-extrabold uppercase">
            COMPLETE YOUR ORDER
          </h2>

          <p className="mt-2 max-w-[340px] text-[11px] leading-5 text-neutral-600">
            You can continue your purchase as a guest or create an account
            to make future orders easier to manage.
          </p>

          <div className="mt-5 flex w-full flex-col gap-2.5">
            <button
              type="button"
              onClick={onContinueAsGuest}
              className="flex h-10 w-full items-center justify-center rounded-[4px] bg-[#D4AF37] text-[10px] font-extrabold uppercase text-black transition hover:bg-[#c49f25]"
            >
              CONTINUE AS GUEST
            </button>

            <Link
              href="/register"
              className="flex h-10 w-full items-center justify-center rounded-[4px] border border-neutral-800 text-[10px] font-extrabold uppercase text-neutral-950 transition hover:bg-neutral-50"
            >
              CREATE AN ACCOUNT
            </Link>

            <Link
              href="/login"
              className="mt-1 text-[10px] font-semibold text-neutral-600 underline underline-offset-2 transition hover:text-[#D4AF37]"
            >
              Already have an account? Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}