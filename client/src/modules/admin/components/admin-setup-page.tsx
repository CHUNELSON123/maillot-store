'use client';

import Link from 'next/link';

export function AdminSetupPage() {
  return <main className="grid min-h-screen place-items-center bg-neutral-100 px-4 py-10 text-neutral-950">
    <section className="w-full max-w-lg border border-neutral-200 bg-white p-6 shadow-sm sm:p-9">
      <Link href="/" className="text-lg font-black leading-none">MAILLOT<span className="block text-[10px] font-bold text-[#b4830b]">STORE</span></Link>
      <p className="mt-8 text-xs font-semibold uppercase tracking-widest text-[#8b6100]">Administrator access</p>
      <h1 className="mt-2 text-2xl font-black">Welcome to MaillotStore administration</h1>
      <p className="mt-2 text-sm leading-6 text-neutral-600">Sign in to your Administrator account, or register a new Administrator account. Administrator registration is limited to three accounts.</p>
      <div className="mt-6 grid gap-3"><Link href="/admin/login" className="bg-[#D4AF37] px-4 py-3 text-center text-sm font-bold text-black">Administrator sign in</Link><Link href="/admin/register" className="border border-neutral-300 px-4 py-3 text-center text-sm font-semibold">Register as Administrator</Link></div>
      <p className="mt-6 text-xs text-neutral-500"><Link href="/" className="underline">Return to storefront</Link></p>
    </section>
  </main>;
}
