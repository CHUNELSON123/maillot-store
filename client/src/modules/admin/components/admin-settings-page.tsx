'use client';

import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { Check, ImagePlus, LoaderCircle, X } from 'lucide-react';
import { useAdminSection } from '../hooks/use-admin-section';
import { adminService } from '../services/admin.service';
import { AdminRecord } from '../types/admin.types';

type SettingTab = 'General' | 'Business Information' | 'Payment Settings' | 'Delivery Settings' | 'Commission Settings' | 'Email Settings' | 'Notification Settings';
type SettingField = { key: string; label: string; description?: string; kind?: 'text' | 'number' | 'select' | 'toggle'; options?: string[]; placeholder?: string };

const tabs: SettingTab[] = ['General', 'Business Information', 'Payment Settings', 'Delivery Settings', 'Commission Settings', 'Email Settings', 'Notification Settings'];
const groups: Record<SettingTab, SettingField[]> = {
  General: [
    { key: 'site_name', label: 'Site Name' },
    { key: 'site_tagline', label: 'Site Tagline' },
    { key: 'default_currency', label: 'Default Currency', description: 'XAF is the only configured catalogue currency. Foreign-currency conversion is not connected.', kind: 'select', options: ['XAF'] },
    { key: 'date_format', label: 'Date Format', kind: 'select', options: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'] },
    { key: 'time_zone', label: 'Time Zone', kind: 'select', options: ['Africa/Douala', 'UTC', 'Europe/Paris'] },
    { key: 'items_per_page', label: 'Items Per Page', kind: 'number' },
    { key: 'low_stock_threshold', label: 'Low Stock Threshold', kind: 'number' },
    { key: 'maintenance_mode', label: 'Maintenance Mode', kind: 'toggle' },
    { key: 'allow_registration', label: 'Allow Registration', kind: 'toggle' },
    { key: 'email_notifications_enabled', label: 'Email Notifications', description: 'Stored for the future email provider integration. Emails cannot be sent until an email API is configured.', kind: 'toggle' },
  ],
  'Business Information': [
    { key: 'business_name', label: 'Business Name' }, { key: 'business_email', label: 'Business Email' },
    { key: 'business_phone', label: 'Business Phone' }, { key: 'business_address', label: 'Business Address' },
    { key: 'business_tax_id', label: 'Tax Identification Number' },
    { key: 'whatsapp_number', label: 'WhatsApp Number', description: 'International format; used by the checkout WhatsApp order button.' },
    { key: 'social_tiktok', label: 'TikTok URL' }, { key: 'social_facebook', label: 'Facebook URL' },
    { key: 'social_snapchat', label: 'Snapchat URL' }, { key: 'social_x', label: 'X URL' },
  ],
  'Payment Settings': [
    { key: 'payment_currency', label: 'Payment Currency', description: 'XAF is the only currency supported by the current payment methods.', kind: 'select', options: ['XAF'] },
    { key: 'payment_methods_enabled', label: 'Enabled Payment Methods', placeholder: 'For example: MTN, Orange, cash' },
    { key: 'payment_instructions', label: 'Payment Instructions' },
  ],
  'Delivery Settings': [
    { key: 'delivery_enabled', label: 'Delivery Available', kind: 'toggle' }, { key: 'delivery_fee', label: 'Default Delivery Fee', kind: 'number' },
    { key: 'free_delivery_threshold', label: 'Free Delivery Minimum Order', kind: 'number' }, { key: 'delivery_information', label: 'Delivery Information' },
  ],
  'Commission Settings': [
    { key: 'influencer_default_commission_rate', label: 'Influencer Commission Rate (%)', description: 'Applies to every influencer for orders placed after this rate is saved. Previously created commissions remain unchanged.', kind: 'number' },
    { key: 'influencer_default_customer_discount_rate', label: 'Default Influencer Customer Discount (%)', kind: 'number' },
    { key: 'influencer_minimum_withdrawal_amount', label: 'Minimum Influencer Withdrawal (XAF)', description: 'Minimum amount an influencer may request from their approved available balance.', kind: 'number' },
  ],
  'Email Settings': [
    { key: 'email_from_name', label: 'Sender Name' }, { key: 'email_from_address', label: 'Sender Email' },
    { key: 'email_provider', label: 'Email Provider' }, { key: 'email_api_key', label: 'Email API Key', placeholder: 'Hidden. Enter a new value to replace it.' },
  ],
  'Notification Settings': [
    { key: 'admin_order_notifications', label: 'New Order Notifications', description: 'Creates in-app admin notifications when a website order is placed.', kind: 'toggle' },
    { key: 'admin_low_stock_notifications', label: 'Low Stock Notifications', description: 'Creates an in-app admin alert when stock first crosses its threshold.', kind: 'toggle' },
    { key: 'customer_order_notifications', label: 'Customer Order Notifications', description: 'Controls in-app order and payment updates. Email and WhatsApp delivery need their respective providers.', kind: 'toggle' },
  ],
};

const descriptionFor = (field: SettingField, current?: AdminRecord) => String(field.description ?? current?.description ?? '');

export function AdminSettingsPage() {
  const settings = useAdminSection('settings');
  const [activeTab, setActiveTab] = useState<SettingTab>('General');
  const [values, setValues] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [uploading, setUploading] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const settingMap = useMemo(() => new Map(settings.items.map((item) => [String(item.key), item])), [settings.items]);

  useEffect(() => {
    const next: Record<string, string> = {};
    settings.items.forEach((item) => { if (!item.isSensitive) next[String(item.key)] = String(item.value ?? ''); });
    setValues(next);
    setDirty(new Set());
  }, [settings.items]);

  const change = (key: string, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    setDirty((current) => new Set(current).add(key));
    setMessage('');
  };

  const upload = async (key: string, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploading(key); setMessage('');
    try { const uploaded = await adminService.uploadCmsImage(file); change(key, uploaded.imageUrl); setMessage('Image uploaded. Save changes to apply the setting.'); }
    catch (cause) { setMessage(cause instanceof Error ? cause.message : 'Could not upload this image.'); }
    finally { setUploading(''); }
  };

  const save = async () => {
    setSaving(true); setMessage('');
    try {
      const keys = [...dirty];
      for (const key of keys) {
        const field = Object.values(groups).flat().find((candidate) => candidate.key === key);
        const current = settingMap.get(key);
        await adminService.updateSetting(key, values[key] ?? '', descriptionFor(field ?? { key, label: key }, current) || field?.label || key);
        if (key === 'items_per_page' && typeof window !== 'undefined') window.localStorage.setItem('maillot-admin-items-per-page', values[key] ?? '20');
      }
      await settings.refresh(1, '');
      setMessage(keys.length ? 'Settings saved.' : 'There are no changes to save.');
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : 'Could not save settings.'); }
    finally { setSaving(false); }
  };

  const fieldInput = (field: SettingField) => {
    const key = field.key;
    const stored = settingMap.get(key);
    const currentValue = values[key] ?? '';
    const common = 'mt-1 block h-10 w-full rounded border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-[#D4AF37]';
    if (field.kind === 'toggle') return <select aria-label={field.label} value={currentValue} onChange={(event) => change(key, event.target.value)} className={common}><option value="">Not configured</option><option value="true">Enabled</option><option value="false">Disabled</option></select>;
    if (field.kind === 'select') return <select aria-label={field.label} value={currentValue} onChange={(event) => change(key, event.target.value)} className={common}><option value="">Not configured</option>{field.options?.map((option) => <option key={option} value={option}>{option}</option>)}</select>;
    return <input aria-label={field.label} type={stored?.isSensitive ? 'password' : field.kind === 'number' ? 'number' : 'text'} min={field.kind === 'number' ? 0 : undefined} max={key.includes('rate') ? 100 : undefined} value={currentValue} onChange={(event) => change(key, event.target.value)} placeholder={stored?.isSensitive ? 'Hidden. Enter a replacement value.' : field.placeholder ?? 'Not configured'} className={common}/>;
  };

  const renderField = (field: SettingField) => <label key={field.key} className="block text-xs font-semibold text-neutral-700">{field.label}{fieldInput(field)}{descriptionFor(field, settingMap.get(field.key)) && <small className="mt-1 block font-normal text-neutral-500">{descriptionFor(field, settingMap.get(field.key))}</small>}</label>;

  return <div className="mx-auto max-w-[1500px] space-y-5">
    <div><p className="text-xs text-neutral-500">Administration / System Settings</p><h1 className="mt-1 text-2xl font-black">System Settings</h1><p className="mt-1 text-sm text-neutral-600">Configure site and store settings.</p></div>
    <nav aria-label="System settings sections" className="flex gap-1 overflow-x-auto border-b border-neutral-200">{tabs.map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} aria-current={activeTab === tab ? 'page' : undefined} className={`shrink-0 border-b-2 px-4 py-3 text-xs font-semibold ${activeTab === tab ? 'border-[#D4AF37] text-[#8b6100]' : 'border-transparent text-neutral-500 hover:text-neutral-800'}`}>{tab}</button>)}</nav>
    {settings.error && <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">{settings.error}</div>}
    {settings.loading ? <div className="border border-neutral-200 bg-white p-10 text-center text-sm text-neutral-500">Loading settings…</div> : <>
      {activeTab === 'General' ? <div className="grid gap-4 xl:grid-cols-[1fr_1fr_0.85fr]">
        <section className="space-y-4 rounded-lg border border-neutral-200 bg-white p-5">{groups.General.slice(0, 5).map(renderField)}</section>
        <section className="space-y-4 rounded-lg border border-neutral-200 bg-white p-5">{groups.General.slice(5).map(renderField)}</section>
        <section className="space-y-5 rounded-lg border border-neutral-200 bg-white p-5">
          {(['site_logo_url', 'site_favicon_url'] as const).map((key) => {
            const isLogo = key === 'site_logo_url'; const label = isLogo ? 'Logo' : 'Favicon'; const url = values[key] ?? '';
            const uploadsBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/v1';
            const imageUrl = url.startsWith('/') ? `${uploadsBase.replace(/\/v1\/?$/, '')}${url}` : url;
            return <div key={key}><h2 className="mb-2 text-xs font-semibold">{label}</h2><div className="grid h-24 place-items-center overflow-hidden rounded border border-neutral-200 bg-neutral-50">{url ? <img src={imageUrl} alt={`${label} preview`} className="max-h-full max-w-full object-contain"/> : <span className="text-xs text-neutral-400">No {label.toLowerCase()} configured</span>}</div><div className="mt-2 flex gap-2"><label className="inline-flex cursor-pointer items-center gap-2 rounded border border-neutral-200 px-3 py-2 text-xs font-semibold hover:border-[#D4AF37]">{uploading === key ? <LoaderCircle size={14} className="animate-spin"/> : <ImagePlus size={14}/>}Change {label}<input type="file" accept="image/*" className="sr-only" disabled={Boolean(uploading)} onChange={(event) => void upload(key, event)}/></label><button type="button" disabled={!url} onClick={() => change(key, '')} className="inline-flex items-center gap-1 rounded border border-neutral-200 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-40"><X size={14}/>Remove</button></div></div>;
          })}
          <p className="text-[11px] leading-relaxed text-neutral-500">Images are uploaded to the project’s existing CMS upload service and the resulting path is saved with these settings.</p>
        </section>
      </div> : <section className="grid gap-4 rounded-lg border border-neutral-200 bg-white p-5 md:grid-cols-2">{groups[activeTab].map(renderField)}{activeTab === 'Email Settings' && <p className="md:col-span-2 rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">Email sending is not connected yet. These values can be stored, but they will not send emails until an email API is configured.</p>}</section>}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">{message && <p role="status" className="text-sm text-neutral-600">{message}</p>}<button onClick={() => void save()} disabled={saving || settings.loading} className="inline-flex items-center justify-center gap-2 rounded bg-[#D48800] px-5 py-3 text-xs font-bold text-white hover:bg-[#bd7700] disabled:opacity-50"><Check size={15}/>{saving ? 'Saving Changes…' : 'Save Changes'}</button></div>
    </>}
  </div>;
}
