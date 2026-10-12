
import Link from "next/link";

import { CustomerLayout } from "@/modules/customer/components/customer-layout";
import { ContactInformation } from "@/modules/customer/components/contact/contact-information";
import { ContactForm } from "@/modules/customer/components/contact/contact-form";
import { ContactMap } from "@/modules/customer/components/contact/contact-map";
import { NewsletterSection } from "@/components/shared/newsletter-section";

export default function ContactPage() {
  return (
    <CustomerLayout>
      <main className="bg-white text-neutral-950">
        <section className="mx-auto max-w-[1200px] px-4 pb-8 pt-4 sm:px-8 lg:px-5">
          <nav
            aria-label="Breadcrumb"
            className="mb-5 flex items-center gap-2 text-[10px] text-neutral-500"
          >
            <Link
              href="/"
              className="transition hover:text-[#D4AF37]"
            >
              Home
            </Link>

            <span aria-hidden="true">›</span>

            <span className="font-semibold text-neutral-950">
              Contact
            </span>
          </nav>

          <header className="mb-6">
            <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
              CONTACT US
            </h1>

            <p className="mt-2 text-xs leading-5 text-neutral-600">
              We&apos;d love to hear from you. Reach out to us!
            </p>
          </header>

          <div className="grid items-start gap-8 md:grid-cols-[0.78fr_1.05fr_1.25fr] md:gap-6 lg:gap-8">
            <ContactInformation />

            <ContactForm />

            <ContactMap />
          </div>
        </section>

        <div className="[&_section]:mt-0">
          <NewsletterSection />
        </div>
      </main>
    </CustomerLayout>
  );
}
