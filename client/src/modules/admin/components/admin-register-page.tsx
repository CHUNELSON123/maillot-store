'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { apiClient } from '@/services/api/api-client';

export function AdminRegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    setBusy(true);
    try {
      await apiClient('/admin/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) });
      window.location.assign('/admin/login?registered=1');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not register this Administrator account.');
    } finally { setBusy(false); }
  };

  return <main className="grid min-h-screen place-items-center bg-neutral-100 px-4 py-10 text-neutral-950"><section className="w-full max-w-lg border border-neutral-200 bg-white p-6 shadow-sm sm:p-9">
    <Link href="/" className="text-lg font-black leading-none">MAILLOT<span className="block text-[10px] font-bold text-[#b4830b]">STORE</span></Link>
    <p className="mt-8 text-xs font-semibold uppercase tracking-widest text-[#8b6100]">Administrator registration</p><h1 className="mt-2 text-2xl font-black">Create an Administrator account</h1>
    <p className="mt-2 text-sm leading-6 text-neutral-600">Use your email and password to register. After registration, sign in to open the administration dashboard. Up to three Administrator accounts are allowed.</p>
    <form onSubmit={submit} className="mt-6 space-y-4">
      <label className="block text-xs font-semibold">Email address<input required type="email" autoComplete="email" maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 block w-full border border-neutral-300 px-3 py-2.5 text-sm"/></label>
      <label className="block text-xs font-semibold">Password<input required type="password" autoComplete="new-password" minLength={8} maxLength={200} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 block w-full border border-neutral-300 px-3 py-2.5 text-sm"/><small className="mt-1 block font-normal text-neutral-500">At least 8 characters.</small></label>
      <label className="block text-xs font-semibold">Confirm password<input required type="password" autoComplete="new-password" minLength={8} maxLength={200} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-1 block w-full border border-neutral-300 px-3 py-2.5 text-sm"/></label>
      {error && <p role="alert" className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <button disabled={busy} className="w-full bg-[#D4AF37] px-4 py-3 text-sm font-bold text-black disabled:opacity-50">{busy ? 'Registering…' : 'Register Administrator'}</button>
    </form>
    <p className="mt-5 text-center text-sm text-neutral-600">Already have an account? <Link href="/admin/login" className="font-semibold text-[#8b6100] underline">Sign in</Link></p>
    <p className="mt-5 text-center text-xs"><Link href="/" className="text-neutral-500 underline">Return to storefront</Link></p>
  </section></main>;
}
