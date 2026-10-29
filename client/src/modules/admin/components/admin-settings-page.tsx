'use client';

import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { useAdminSection } from '../hooks/use-admin-section';
import { adminService } from '../services/admin.service';
import { AdminRecord } from '../types/admin.types';

export function AdminSettingsPage() {
  const settings = useAdminSection('settings');
  const [values, setValues] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => { const initial: Record<string, string> = {}; settings.items.forEach((setting) => { if (!setting.isSensitive) initial[String(setting.key)] = String(setting.value ?? ''); }); setValues(initial); }, [settings.items]);
  const save = async (setting: AdminRecord) => {
    const key = String(setting.key); setSavingKey(key); setMessage('');
    try { if (setting.isSensitive && !values[key]?.trim()) throw new Error('Enter a replacement value before saving this sensitive setting.'); await adminService.updateSetting(key, values[key] ?? '', String(setting.description ?? '')); setMessage(`Saved ${key}.`); await settings.refresh(1, ''); }
    catch (cause) { setMessage(cause instanceof Error ? cause.message : `Could not save ${key}.`); }
    finally { setSavingKey(''); }
  };
  return <div className="mx-auto max-w-[1500px] space-y-5"><div><p className="text-xs text-neutral-500">Administration / System Settings</p><h1 className="mt-1 text-2xl font-black">System Settings</h1><p className="mt-1 text-sm text-neutral-600">Values are stored in system_settings. A saved setting affects behavior only where the application reads that key.</p></div>
    {message && <p className="border border-neutral-200 bg-white p-3 text-sm">{message}</p>}
    {settings.error ? <div className="border border-red-200 bg-red-50 p-5 text-sm text-red-700">{settings.error}</div> : settings.loading ? <div className="border border-neutral-200 bg-white p-10 text-center text-sm text-neutral-500">Loading saved settings…</div> : settings.items.length === 0 ? <div className="border border-neutral-200 bg-white p-10 text-center text-sm text-neutral-500">No system settings are configured yet.</div> : <div className="grid gap-4 xl:grid-cols-2">{settings.items.map((setting) => { const key = String(setting.key); const sensitive = Boolean(setting.isSensitive); return <article key={key} className="border border-neutral-200 bg-white p-5"><div className="flex items-start justify-between gap-3"><div><h2 className="font-bold">{key.replaceAll('_', ' ')}</h2><p className="mt-1 text-xs text-neutral-500">{String(setting.description ?? 'Saved configuration')}</p></div>{sensitive && <span className="text-[10px] font-semibold uppercase text-amber-700">Sensitive</span>}</div><label className="mt-4 block text-xs font-semibold">{sensitive ? 'Enter replacement value' : 'Value'}<input type={sensitive ? 'password' : 'text'} value={values[key] ?? ''} onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))} placeholder={sensitive ? 'Hidden. Enter a new value to replace.' : ''} className="mt-1 block w-full border border-neutral-300 px-3 py-2 text-sm font-normal"/></label><button onClick={() => void save(setting)} disabled={savingKey === key} className="mt-4 inline-flex items-center gap-2 bg-[#D4AF37] px-4 py-2 text-xs font-bold disabled:opacity-50"><Check size={14}/>{savingKey === key ? 'Saving…' : 'Save setting'}</button></article>; })}</div>}
  </div>;
}
