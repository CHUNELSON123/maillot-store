
import Image from 'next/image';
import Link from 'next/link';
import {
  BadgePercent,
  Gift,
  LineChart,
  Link2,
  Camera,
  Music2,
  CirclePlay,
  UsersRound,
} from 'lucide-react';
import { CustomerLayout } from '@/modules/customer/components/customer-layout';
import { NewsletterSection } from '@/components/shared/newsletter-section';

const benefits = [
  {
    icon: BadgePercent,
    title: 'EARN COMMISSIONS',
    text: 'Earn commission on eligible purchases made through your referral links.',
  },
  {
    icon: Gift,
    title: 'EXCLUSIVE BENEFITS',
    text: 'Get access to selected offers and product updates.',
  },
  {
    icon: Link2,
    title: 'EASY TO START',
    text: 'Apply, wait for review, then share your approved referral links.',
  },
  {
    icon: LineChart,
    title: 'REAL-TIME TRACKING',
    text: 'View recorded clicks, attributed orders, and commission records in your portal.',
  },
];

export function InfluencerLandingPage() {
  return (
    <CustomerLayout>
      <main className="mx-auto max-w-[1200px] px-4 pb-8 sm:px-8">
        <div className="mb-3 pt-3 text-xs text-neutral-500">
          <Link href="/">Home</Link>
          <span className="mx-2">›</span>
          Become an Influencer
        </div>

        <section className="grid min-h-[350px] overflow-hidden border border-neutral-200 md:grid-cols-[0.9fr_1.1fr]">
          <div className="flex flex-col justify-center px-6 py-9 sm:px-10">
            <p className="text-sm font-bold uppercase tracking-[.14em] text-[#b88300]">
              Maillot Store Partner Programme
            </p>

            <h1 className="mt-3 max-w-lg text-4xl font-black leading-[1.04] text-black sm:text-5xl">
              BECOME A
              <span className="block text-[#D4AF37]">MAILLOT STORE</span>
              INFLUENCER
            </h1>

            <p className="mt-4 max-w-md text-sm leading-6 text-neutral-700">
              Share your passion for sports and earn rewards from eligible
              sales through your approved referral links.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/influencer/apply"
                className="inline-flex h-11 items-center bg-[#D4AF37] px-7 text-xs font-extrabold text-black hover:bg-[#c6a02f]"
              >
                APPLY NOW
              </Link>

              <a
                href="#program"
                className="inline-flex h-11 items-center border border-neutral-500 px-7 text-xs font-extrabold text-black hover:bg-neutral-50"
              >
                LEARN MORE
              </a>
            </div>

            <p className="mt-5 text-xs text-neutral-600">
              Already have an account?{' '}
              <Link
                href="/login?returnUrl=%2Finfluencer%2Fportal%2Fdashboard"
                className="font-bold text-[#9b740b] underline underline-offset-4 hover:text-black"
              >
                Log in
              </Link>
            </p>
          </div>

          <div className="relative min-h-[280px] bg-neutral-900">
            <Image
              src="/about-maillot-store.png"
              alt="Maillot Store sports apparel and merchandise"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 55vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-black/10" />
          </div>
        </section>

        <section id="program" className="py-7">
          <h2 className="text-center text-xl font-black text-black">
            WHY JOIN OUR PROGRAM?
          </h2>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map(({ icon: Icon, title, text }) => (
              <article
                key={title}
                className="border border-neutral-200 px-4 py-5 text-center"
              >
                <Icon
                  className="mx-auto text-[#D4AF37]"
                  size={31}
                  strokeWidth={1.5}
                />
                <h3 className="mt-3 text-xs font-extrabold text-black">
                  {title}
                </h3>
                <p className="mt-2 text-xs leading-5 text-neutral-600">
                  {text}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-5 bg-black p-6 text-white md:grid-cols-[1fr_auto] md:items-center sm:p-8">
          <div>
            <h2 className="text-sm font-extrabold">WHO CAN JOIN?</h2>
            <p className="mt-2 max-w-2xl text-xs leading-5 text-neutral-300">
              Anyone with a genuine passion for sports and an active online
              presence can apply. Share the channels where you create content
              and tell us about your audience.
            </p>
          </div>

          <div
            className="flex flex-wrap items-center gap-5 text-xs text-white"
            aria-label="Supported social platforms"
          >
            <span className="inline-flex items-center gap-1.5">
              <Camera size={17} />
              Instagram
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Music2 size={17} />
              TikTok
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CirclePlay size={18} />
              YouTube
            </span>
            <span className="inline-flex items-center gap-1.5">
              <UsersRound size={17} />
              Facebook
            </span>
            <span className="font-bold">𝕏</span>
          </div>
        </section>
      </main>

      <NewsletterSection flush />
    </CustomerLayout>
  );
}
