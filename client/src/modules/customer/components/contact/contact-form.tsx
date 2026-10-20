
"use client";

import { FormEvent, useState } from "react";
import { Send } from "lucide-react";
import { communicationsService } from "@/modules/communications/services/communications.service";

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"success" | "error" | "">("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setIsSubmitting(true);
    setStatus("");

    try {
      await communicationsService.submitContactMessage({
        name: String(data.get("name") ?? ""),
        email: String(data.get("email") ?? ""),
        subject: String(data.get("subject") ?? ""),
        message: String(data.get("message") ?? ""),
      });
      form.reset();
      setStatus("success");
    } catch {
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section aria-labelledby="contact-form-title">
      <h2
        id="contact-form-title"
        className="text-sm font-extrabold uppercase tracking-wide"
      >
        SEND US A MESSAGE
      </h2>

      <p className="mt-2 text-xs leading-5 text-neutral-600">
        Have a question? We would love to hear from you.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label
            htmlFor="contact-name"
            className="mb-1.5 block text-xs font-semibold"
          >
            Your Name
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Enter your name"
            required
            className="h-10 w-full rounded-md border border-neutral-200 bg-white px-3 text-xs outline-none transition focus:border-[#D4AF37]"
          />
        </div>

        <div>
          <label
            htmlFor="contact-email"
            className="mb-1.5 block text-xs font-semibold"
          >
            Email Address
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
            required
            className="h-10 w-full rounded-md border border-neutral-200 bg-white px-3 text-xs outline-none transition focus:border-[#D4AF37]"
          />
        </div>

        <div>
          <label
            htmlFor="contact-subject"
            className="mb-1.5 block text-xs font-semibold"
          >
            Subject
          </label>
          <input
            id="contact-subject"
            name="subject"
            type="text"
            placeholder="How can we help you?"
            required
            className="h-10 w-full rounded-md border border-neutral-200 bg-white px-3 text-xs outline-none transition focus:border-[#D4AF37]"
          />
        </div>

        <div>
          <label
            htmlFor="contact-message"
            className="mb-1.5 block text-xs font-semibold"
          >
            Message
          </label>
          <textarea
            id="contact-message"
            name="message"
            rows={5}
            placeholder="Type your message here..."
            required
            className="w-full resize-y rounded-md border border-neutral-200 bg-white px-3 py-2.5 text-xs outline-none transition focus:border-[#D4AF37]"
          />
        </div>

        {status === "success" && (
          <p
            role="status"
            className="rounded-md border border-green-200 bg-green-50 p-3 text-xs leading-5 text-green-900"
          >
            Your message has been saved. It has not been emailed; email delivery is not configured.
          </p>
        )}

        {status === "error" && (
          <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            We could not save your message. Please try again.
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#D4AF37] px-5 text-xs font-extrabold uppercase text-black transition hover:bg-[#c49f25]"
        >
          <Send size={14} />
          {isSubmitting ? "Saving..." : "Send Message"}
        </button>
      </form>
    </section>
  );
}
