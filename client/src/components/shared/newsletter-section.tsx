"use client";

import { FormEvent, useState } from "react";
import { communicationsService } from "@/modules/communications/services/communications.service";

export function NewsletterSection({ flush = false }: { flush?: boolean }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"success" | "error" | "">("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setIsSubmitting(true);
    setStatus("");

    try {
      await communicationsService.subscribeToNewsletter(
        String(data.get("email") ?? ""),
      );
      form.reset();
      setStatus("success");
    } catch {
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={flush
      ? "w-full overflow-hidden rounded-t-2xl bg-black px-6 py-7 text-white sm:px-10"
      : "mt-5 overflow-hidden rounded-2xl bg-black px-6 py-7 text-white sm:px-10"}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-wide">STAY IN THE LOOP</p>
          <p className="mt-1 max-w-md text-sm leading-6 text-neutral-300">
            Save your email for future MaillotStore updates and promotions.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex w-full max-w-xl">
          <input
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            placeholder="Enter your email address"
            className="h-12 min-w-0 flex-1 rounded-l-md border border-neutral-300 bg-white px-4 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-[#D4AF37]"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-12 rounded-r-md bg-[#D4AF37] px-6 text-sm font-semibold text-white transition hover:bg-[#bf9828] disabled:opacity-60"
          >
            {isSubmitting ? "SAVING..." : "SUBSCRIBE"}
          </button>
        </form>
      </div>

      {status && (
        <p
          role={status === "error" ? "alert" : "status"}
          className={`mt-4 text-sm ${status === "error" ? "text-red-300" : "text-green-300"}`}
        >
          {status === "success"
            ? "Your email is saved for future updates. Email campaigns are not configured yet."
            : "We could not save your email. Please try again."}
        </p>
      )}
    </section>
  );
}
