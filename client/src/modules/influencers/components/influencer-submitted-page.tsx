'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, Gift, Mail, UserRound } from 'lucide-react';
import { CustomerLayout } from '@/modules/customer/components/customer-layout';
import { NewsletterSection } from '@/components/shared/newsletter-section';

export function InfluencerSubmittedPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
 useEffect(() => {
  const submitted =
    sessionStorage.getItem('maillot_influencer_application_submitted') === 'true';

  if (!submitted) {
    router.replace('/influencer');
    return;
  }

  setReady(true);
}, [router]);
  if (!ready) return null;
  return <CustomerLayout><main className="mx-auto max-w-[1200px] px-4 pb-8 sm:px-8">
    <div className="mb-4 pt-3 text-xs text-neutral-500"><Link href="/">Home</Link><span className="mx-2">›</span><Link href="/influencer">Become an Influencer</Link><span className="mx-2">›</span>Application Submitted</div>
    <section className="mx-auto max-w-[850px] border border-neutral-200 px-6 py-9 text-center shadow-sm sm:px-12 sm:py-12">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-700 text-white"><Check size={48} strokeWidth={3}/></div>
      <h1 className="mt-5 text-2xl font-black text-black">APPLICATION SUBMITTED!</h1>
      <p className="mx-auto mt-3 max-w-md text-sm font-semibold leading-6 text-green-700">Thank you for your interest in becoming a Maillot Store Influencer.</p>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-neutral-800">Your application has been saved and is pending review. You can sign in to check its status. Referral tools become available only after approval.</p>
      <div className="mt-8 border border-neutral-200 p-5">
        <h2 className="text-sm font-extrabold">WHAT HAPPENS NEXT?</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          <div className="border-b border-neutral-200 pb-4 sm:border-b-0 sm:border-r sm:pb-0"><Mail className="mx-auto" size={24}/><h3 className="mt-2 text-xs font-bold">Application saved</h3><p className="mt-1 text-xs leading-5 text-neutral-600">Your details are stored for the review process.</p></div>
          <div className="border-b border-neutral-200 pb-4 sm:border-b-0 sm:border-r sm:pb-0"><UserRound className="mx-auto" size={24}/><h3 className="mt-2 text-xs font-bold">Application review</h3><p className="mt-1 text-xs leading-5 text-neutral-600">The Maillot Store team will review your profile.</p></div>
          <div><Gift className="mx-auto" size={24}/><h3 className="mt-2 text-xs font-bold">Portal after approval</h3><p className="mt-1 text-xs leading-5 text-neutral-600">Once approved, your referral and earnings tools will unlock.</p></div>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-3"><Link href="/login?returnUrl=%2Finfluencer%2Fportal%2Fdashboard" className="inline-flex h-11 items-center bg-[#D4AF37] px-8 text-xs font-extrabold text-black">SIGN IN</Link><Link href="/" className="inline-flex h-11 items-center border border-neutral-400 px-8 text-xs font-extrabold">GO TO HOME PAGE</Link></div>
    </section>
  </main><NewsletterSection flush /></CustomerLayout>;
}
