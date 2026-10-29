'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '@/services/api/api-client';
import { authStorage } from '@/lib/auth/auth-storage';
import { AuthResponse } from '@/modules/auth/types/auth.types';

export function AdminLoginPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const response = await apiClient<AuthResponse>('/admin/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      authStorage.setToken(response.accessToken);
      window.location.assign('/admin/dashboard');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to sign in. Check your details and try again.'); }
    finally { setBusy(false); }
  };

  return <main className="grid min-h-screen place-items-center bg-neutral-100 px-4 py-10 text-neutral-950"><section className="w-full max-w-lg border border-neutral-200 bg-white p-6 shadow-sm sm:p-9">
    <Link href="/" className="text-lg font-black leading-none">MAILLOT<span className="block text-[10px] font-bold text-[#b4830b]">STORE</span></Link>
    <p className="mt-8 text-xs font-semibold uppercase tracking-widest text-[#8b6100]">Administrator sign in</p><h1 className="mt-2 text-2xl font-black">Sign in to administration</h1>
    {searchParams.get('registered') === '1' && <p className="mt-4 border border-green-200 bg-green-50 p-3 text-sm text-green-800">Administrator account registered. Sign in to continue.</p>}
    <form onSubmit={submit} className="mt-6 space-y-4">
      <label className="block text-xs font-semibold">Email address<input required type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 block w-full border border-neutral-300 px-3 py-2.5 text-sm"/></label>
      <label className="block text-xs font-semibold">Password<input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 block w-full border border-neutral-300 px-3 py-2.5 text-sm"/></label>
      {error && <p role="alert" className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <button disabled={busy} className="w-full bg-[#D4AF37] px-4 py-3 text-sm font-bold text-black disabled:opacity-50">{busy ? 'Signing in…' : 'Sign in'}</button>
    </form>
    <p className="mt-5 text-center text-sm text-neutral-600">No account yet? <Link href="/admin/register" className="font-semibold text-[#8b6100] underline">Register as Administrator</Link></p>
    <p className="mt-5 text-center text-xs"><Link href="/" className="text-neutral-500 underline">Return to storefront</Link></p>
  </section></main>;
}
