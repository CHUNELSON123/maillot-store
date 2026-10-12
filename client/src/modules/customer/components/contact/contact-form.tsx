
"use client";

import { FormEvent, useState } from "react";
import { Mail, Send } from "lucide-react";

export function ContactForm() {
  const [isReady, setIsReady] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // The contact API will be connected when the backend is implemented.
    setIsReady(true);
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

        {isReady && (
          <p
            role="status"
            className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900"
          >
            The contact form is ready, but message delivery has not
            been connected yet. Your message has not been sent.
          </p>
        )}

        <button
          type="submit"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#D4AF37] px-5 text-xs font-extrabold uppercase text-black transition hover:bg-[#c49f25]"
        >
          <Send size={14} />
          Send Message
        </button>
      </form>
    </section>
  );
}
