"use client";

import { FormEvent, useState } from "react";
import { communicationsService } from "@/modules/communications/services/communications.service";

export function NewsletterSection({ flush = false }: { flush?: boolean }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"success" | "error" | "">("");
  const [contact, setContact] = useState("");
  const isPhone = contact.trim().length > 0 && !contact.includes("@");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setIsSubmitting(true);
    setStatus("");

    try {
      await communicationsService.subscribeToNewsletter(
        {
          contact: String(data.get("contact") ?? ""),
          whatsappOptIn: data.get("whatsappOptIn") === "on",
        },
      );
      form.reset();
      setContact("");
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
            Subscribe with your email address or WhatsApp number for Maillot Store updates.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid w-full max-w-xl gap-2 sm:grid-cols-[1fr_auto]">
          <input name="contact" type="text" required maxLength={254} autoComplete="email tel" value={contact} onChange={(event) => setContact(event.target.value)} placeholder="Email address or WhatsApp number" className="h-11 min-w-0 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-[#D4AF37]" />
          <button type="submit" disabled={isSubmitting} className="h-11 rounded-md bg-[#D4AF37] px-5 text-sm font-semibold text-white transition hover:bg-[#bf9828] disabled:opacity-60">{isSubmitting ? "SAVING..." : "SUBSCRIBE"}</button>
          {isPhone && <label className="flex items-start gap-2 text-[11px] leading-relaxed text-neutral-300 sm:col-span-2"><input name="whatsappOptIn" type="checkbox" className="mt-0.5 accent-[#D4AF37]"/>I agree to receive Maillot Store updates on WhatsApp at this number.</label>}
        </form>
      </div>

      {status && (
        <p
          role={status === "error" ? "alert" : "status"}
          className={`mt-4 text-sm ${status === "error" ? "text-red-300" : "text-green-300"}`}
        >
          {status === "success"
            ? "Your subscription is saved. WhatsApp updates will be sent only when you have opted in."
            : "We could not save your email. Please try again."}
        </p>
      )}
    </section>
  );
}
