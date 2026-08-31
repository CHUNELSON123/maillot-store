import Link from "next/link";
import { ReactNode } from "react";
import { AuthBenefits } from "./auth-benefits";
import { AuthImagePanel } from "./auth-image-panel";
import { NewsletterSection } from "@/components/shared/newsletter-section";

interface AuthPageLayoutProps {
  title: string;
  description: ReactNode;
  form: ReactNode;
  imageSrc: string;
  imageAlt: string;
}

export function AuthPageLayout({
  title,
  description,
  form,
  imageSrc,
  imageAlt,
}: AuthPageLayoutProps) {
  return (
    <main className="min-h-screen bg-white px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
            <div className="px-6 py-10 sm:px-10 lg:px-16 lg:py-12">
              <div className="mx-auto max-w-md">
                <div className="mb-9 text-center">
                  <h1 className="text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
                    {title}
                  </h1>

                  <div className="mt-3 text-base leading-6 text-neutral-700">
                    {description}
                  </div>
                </div>

                {form}
              </div>
            </div>

            <AuthImagePanel
              src={imageSrc}
              alt={imageAlt}
            />
          </div>

          <AuthBenefits />
        </section>

        <NewsletterSection />

        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-sm text-neutral-500 hover:text-neutral-900"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
} 