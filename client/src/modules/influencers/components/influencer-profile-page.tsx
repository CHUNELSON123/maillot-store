'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { Camera, KeyRound, Bell, CreditCard, ShieldCheck } from 'lucide-react';
import { influencerService } from '../services/influencer.service';
import { useInfluencerPortal } from './influencer-portal-context';

const apiOrigin = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/v1').replace(/\/v1\/?$/, '');
type ProfileForm = { email: string; firstName: string; lastName: string; phone: string; country: string; city: string; occupation: string; bio: string; instagramUrl: string; tiktokUrl: string; youtubeUrl: string; facebookUrl: string; xUrl: string };
const blank: ProfileForm = { email: '', firstName: '', lastName: '', phone: '', country: '', city: '', occupation: '', bio: '', instagramUrl: '', tiktokUrl: '', youtubeUrl: '', facebookUrl: '', xUrl: '' };

export function InfluencerProfilePage() {
  const { data, refresh } = useInfluencerPortal();
  const [form, setForm] = useState<ProfileForm>(blank);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [settingInfo, setSettingInfo] = useState('');
  useEffect(() => {
    const p = data?.profile.profile;
    if (!p) return;
    setForm({ email: p.email ?? '', firstName: p.firstName ?? '', lastName: p.lastName ?? '', phone: p.phone ?? '', country: p.country ?? '', city: p.city ?? '', occupation: p.occupation ?? '', bio: p.bio ?? '', instagramUrl: p.instagramUrl ?? '', tiktokUrl: p.tiktokUrl ?? '', youtubeUrl: p.youtubeUrl ?? '', facebookUrl: p.facebookUrl ?? '', xUrl: p.xUrl ?? '' });
  }, [data?.profile.id, data?.profile.profile]);
  if (!data) return null;
  const set = (key: keyof ProfileForm, value: string) => setForm(current => ({ ...current, [key]: value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true); setError(''); setMessage('');
    try {
      await influencerService.updateProfile({ ...form, instagramUrl: form.instagramUrl || undefined, tiktokUrl: form.tiktokUrl || undefined, youtubeUrl: form.youtubeUrl || undefined, facebookUrl: form.facebookUrl || undefined, xUrl: form.xUrl || undefined });
      await refresh(); setMessage('Your profile changes have been saved.');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not save your profile.'); }
    finally { setSaving(false); }
  };
  const photoChanged = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    setUploading(true); setError(''); setMessage('');
    try { await influencerService.uploadProfilePhoto(file); await refresh(); setMessage('Profile photo saved.'); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not save profile photo.'); }
    finally { setUploading(false); event.target.value = ''; }
  };
  const profileImage = data.profile.profile.profilePictureUrl;
  const settings = [
    [KeyRound, 'Change Password', 'Password changes are not supported by the current account API.'],
    [Bell, 'Notification Settings', 'Notification preferences are not stored in the current database model.'],
    [CreditCard, 'Payment Information', 'The withdrawal workflow has no saved payout-method model yet.'],
    [ShieldCheck, 'Two-Factor Authentication', 'Two-factor authentication is not configured in the current authentication module.'],
  ] as const;
  const field = (label: string, key: keyof ProfileForm, type = 'text', wide = false) => <label className={`block text-[10px] font-semibold ${wide ? 'sm:col-span-2' : ''}`}>{label}<input type={type} value={form[key]} onChange={e => set(key, e.target.value)} maxLength={key === 'bio' ? 2000 : 254} className="mt-1.5 h-9 w-full border border-neutral-300 px-3 text-xs font-normal outline-none focus:border-[#D4AF37]"/></label>;
  return <div className="mx-auto max-w-[1250px]"><div className="mb-5"><h1 className="text-2xl font-black">Profile / Settings</h1><p className="mt-1 text-xs text-neutral-600">Manage the profile information used in your influencer application.</p></div>
    {message && <p role="status" className="mb-4 border border-green-200 bg-green-50 p-3 text-xs text-green-800">{message}</p>}{error && <p role="alert" className="mb-4 border border-red-200 bg-red-50 p-3 text-xs text-red-700">{error}</p>}
    <div className="grid gap-4 xl:grid-cols-[1.3fr_.8fr_.9fr]"><form onSubmit={submit} className="border border-neutral-200 bg-white p-4 sm:p-5"><h2 className="text-sm font-extrabold">Profile Information</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{field('First Name','firstName')}{field('Last Name','lastName')}{field('Email Address','email','email',true)}{field('Phone Number','phone','tel')}{field('Country','country')}{field('City','city')}{field('Occupation','occupation','text',true)}<label className="block text-[10px] font-semibold sm:col-span-2">About You<textarea value={form.bio} onChange={e => set('bio', e.target.value)} maxLength={2000} className="mt-1.5 min-h-24 w-full border border-neutral-300 p-3 text-xs font-normal outline-none focus:border-[#D4AF37]"/></label><div className="sm:col-span-2"><h3 className="mb-2 text-[10px] font-bold">Social Profiles</h3><div className="grid gap-3 sm:grid-cols-2">{field('Instagram','instagramUrl','url')}{field('TikTok','tiktokUrl','url')}{field('YouTube','youtubeUrl','url')}{field('Facebook','facebookUrl','url')}{field('X (Twitter)','xUrl','url')}</div></div></div><button disabled={saving} className="mt-5 h-10 w-full bg-[#D4AF37] text-[10px] font-extrabold text-black disabled:opacity-60">{saving ? 'SAVING…' : 'SAVE CHANGES'}</button></form>
      <section className="border border-neutral-200 bg-white p-4 text-center sm:p-5"><h2 className="text-left text-sm font-extrabold">Profile Picture</h2><div className="relative mx-auto mt-5 flex h-36 w-36 items-center justify-center overflow-hidden rounded-full bg-neutral-100">{profileImage ? <img src={/^https?:\/\//.test(profileImage) ? profileImage : `${apiOrigin}${profileImage}`} alt="Influencer profile" className="h-full w-full object-cover"/> : <span className="text-4xl font-bold text-neutral-400">{form.firstName.slice(0,1).toUpperCase() || '?'}</span>}</div><label className="mt-5 inline-flex h-9 cursor-pointer items-center gap-2 border border-neutral-400 px-4 text-[10px] font-bold"><Camera size={14}/>{uploading ? 'UPLOADING…' : 'CHANGE PHOTO'}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={photoChanged} className="sr-only"/></label><p className="mt-2 text-[9px] text-neutral-500">JPG, PNG, or WebP. Maximum 2 MB.</p></section>
      <section className="border border-neutral-200 bg-white p-4 sm:p-5"><h2 className="text-sm font-extrabold">Account Settings</h2><div className="mt-3 divide-y divide-neutral-100">{settings.map(([Icon,label,info])=><button key={label} onClick={() => setSettingInfo(info)} className="flex w-full items-center gap-3 py-4 text-left"><Icon size={17}/><span className="flex-1"><strong className="block text-[11px]">{label}</strong><small className="mt-1 block text-[9px] text-neutral-500">Review availability</small></span><span className="text-neutral-400">›</span></button>)}</div></section>
    </div>
    {settingInfo && <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="w-full max-w-md border border-neutral-200 bg-white p-6"><h2 className="text-sm font-extrabold">Setting unavailable</h2><p className="mt-3 text-xs leading-5 text-neutral-700">{settingInfo}</p><button onClick={() => setSettingInfo('')} className="mt-5 h-9 bg-[#D4AF37] px-6 text-[10px] font-bold">CLOSE</button></div></div>}
  </div>;
}
