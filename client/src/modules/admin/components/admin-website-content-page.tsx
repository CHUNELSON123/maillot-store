'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Eye, Pencil, Plus, Trash2, X } from 'lucide-react';
import { adminService } from '../services/admin.service';
import { cmsService } from '@/modules/cms/services/cms.service';
import { AdminRecord } from '../types/admin.types';
import { pageContentDefaults, pageContentValue } from '@/modules/cms/utils/page-content-defaults';

type ContentTab = 'banners' | 'promotions' | 'featured' | 'about' | 'contact';
type ContentRecord = AdminRecord & { _recordType: 'Banner' | 'Promotion' };
type CmsForm = { title: string; imageUrl: string; linkUrl: string; description: string; discountType: string; discountValue: string; startDate: string; endDate: string; isActive: boolean; targetType: string; targetIds: string[] };
type SettingField = { key: string; label: string; multiline?: boolean; type?: string };

const tabs: Array<{ key: ContentTab; label: string }> = [
  { key: 'banners', label: 'Banners' }, { key: 'promotions', label: 'Promotions' },
  { key: 'featured', label: 'Featured Products' }, { key: 'about', label: 'About Us' },
  { key: 'contact', label: 'Contact Information' },
];
const aboutFields: SettingField[] = [
  { key: 'cms.about.title', label: 'Page heading' },
  { key: 'cms.about.subtitle', label: 'Subtitle' },
  { key: 'cms.about.description', label: 'About paragraphs', multiline: true },
  { key: 'cms.about.tagline', label: 'Closing tagline' },
  { key: 'cms.about.image', label: 'About page image URL' },
  ...[1, 2, 3, 4].flatMap((index) => [
    { key: `cms.about.feature${index}.title`, label: `Commitment ${index} title` },
    { key: `cms.about.feature${index}.description`, label: `Commitment ${index} description` },
  ]),
];
const contactFields: SettingField[] = [
  { key: 'cms.contact.title', label: 'Page heading' },
  { key: 'cms.contact.subtitle', label: 'Page introduction', multiline: true },
  { key: 'cms.contact.information_title', label: 'Contact information heading' },
  { key: 'cms.contact.information_intro', label: 'Contact information introduction', multiline: true },
  { key: 'cms.contact.address', label: 'Address shown on page and map', multiline: true },
  { key: 'cms.contact.phone', label: 'Phone', type: 'tel' },
  { key: 'cms.contact.email', label: 'Email', type: 'email' },
  { key: 'cms.contact.hours', label: 'Working hours shown on page', multiline: true },
  { key: 'cms.contact.form_title', label: 'Message form heading' },
  { key: 'cms.contact.form_intro', label: 'Message form introduction', multiline: true },
  { key: 'cms.contact.map_title', label: 'Map heading' },
];
const heroFields: SettingField[] = [
  { key: 'cms.home.hero.title', label: 'Default heading when no banner is active', multiline: true },
  { key: 'cms.home.hero.tagline', label: 'Gold tagline' },
  { key: 'cms.home.hero.description', label: 'Description', multiline: true },
  { key: 'cms.home.hero.primary_label', label: 'First button label' },
  { key: 'cms.home.hero.secondary_label', label: 'Second button label' },
  { key: 'cms.home.hero.secondary_link', label: 'Second button destination' },
];
const emptyForm: CmsForm = { title: '', imageUrl: '', linkUrl: '', description: '', discountType: 'PERCENTAGE', discountValue: '', startDate: '', endDate: '', isActive: true, targetType: 'ALL', targetIds: [] };
const panel = 'overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm';

function localInputDate(value?: unknown) {
  if (typeof value !== 'string' || !value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function resolveCmsImageUrl(value: unknown) {
  const imageUrl = String(value ?? '');
  if (!imageUrl.startsWith('/uploads')) return imageUrl;
  try { return `${new URL(process.env.NEXT_PUBLIC_API_URL ?? '').origin}${imageUrl}`; }
  catch { return imageUrl; }
}

export function AdminWebsiteContentPage() {
  const [tab, setTab] = useState<ContentTab>('banners');
  const [records, setRecords] = useState<ContentRecord[]>([]);
  const [products, setProducts] = useState<AdminRecord[]>([]);
  const [brands, setBrands] = useState<AdminRecord[]>([]);
  const [categories, setCategories] = useState<AdminRecord[]>([]);
  const [featuredIds, setFeaturedIds] = useState<string[]>([]);
  const [settingsForm, setSettingsForm] = useState<Record<string, string>>({});
  const [contentReady, setContentReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ContentRecord | null>(null);
  const [form, setForm] = useState<CmsForm>(emptyForm);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [cmsResult, productResult, contentResult, brandResult, categoryResult] = await Promise.allSettled([
        adminService.getSection('cms'), adminService.getProductPage({ page: 1, limit: 48 }), cmsService.getPublicContent(), adminService.getBrands(), adminService.getCategories(),
      ]);
      if (cmsResult.status === 'fulfilled') setRecords(cmsResult.value.items as ContentRecord[]);
      else setError('Could not load banners and promotions. Reload this page to try again.');
      if (productResult.status === 'fulfilled') {
        const productPage = productResult.value;
        const productPages = Math.ceil(productPage.total / 48);
        const otherProductPages = await Promise.allSettled(Array.from({ length: Math.max(0, productPages - 1) }, (_, index) => adminService.getProductPage({ page: index + 2, limit: 48 })));
        setProducts([...productPage.items, ...otherProductPages.flatMap((page) => page.status === 'fulfilled' ? page.value.items : [])]);
        if (otherProductPages.some((page) => page.status === 'rejected')) setError('Some products could not be loaded. Reload before changing product selections.');
      } else setError('Products could not be loaded. Reload before changing product selections.');
      if (brandResult.status === 'fulfilled') setBrands(brandResult.value);
      if (categoryResult.status === 'fulfilled') setCategories(categoryResult.value);
      if (contentResult.status === 'rejected') { setContentReady(false); throw new Error('Could not load saved website content. Reload before editing.'); }
      const savedContent = contentResult.value;
      setSettingsForm({ ...savedContent, ...Object.fromEntries(Object.keys(pageContentDefaults).map((key) => [key, pageContentValue(savedContent, key)])) });
      setContentReady(true);
      try {
        const parsed: unknown = JSON.parse(savedContent['cms.featured_product_ids'] ?? '[]');
        setFeaturedIds(Array.isArray(parsed) ? parsed.map(String) : []);
      } catch { setFeaturedIds([]); }
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not load website content.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const visibleRecords = useMemo(() => records.filter((record) => record._recordType.toLowerCase() === (tab === 'banners' ? 'banner' : 'promotion') && (!search.trim() || String(record.title ?? '').toLowerCase().includes(search.trim().toLowerCase()))), [records, search, tab]);
  const activeBanners = records.filter((record) => record._recordType === 'Banner' && record.isActive === true);
  const activeCount = records.filter((record) => record._recordType.toLowerCase() === (tab === 'banners' ? 'banner' : 'promotion') && record.isActive === true).length;

  const openCreate = () => { setEditing(null); setForm({ ...emptyForm }); setError(''); setNotice(''); setDialogOpen(true); };
  const openEdit = (record: ContentRecord) => {
    setEditing(record); setError(''); setNotice('');
    setForm({
      ...emptyForm,
      title: String(record.title ?? ''), imageUrl: String(record.imageUrl ?? ''), linkUrl: String(record.linkUrl ?? ''),
      description: String(record.description ?? ''), discountType: String(record.discountType ?? 'PERCENTAGE'),
      discountValue: record.discountValue === undefined ? '' : String(record.discountValue),
      startDate: localInputDate(record.startDate), endDate: localInputDate(record.endDate), isActive: record.isActive !== false,
      targetType: String(record.targetType ?? 'ALL'), targetIds: Array.isArray(record.targetIds) ? record.targetIds.map(String) : [],
    });
    setDialogOpen(true);
  };

  const saveRecord = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setWorking(true); setError('');
    try {
      if (tab === 'banners') {
        const data = { title: form.title.trim(), imageUrl: form.imageUrl.trim(), linkUrl: form.linkUrl.trim() || undefined, isActive: form.isActive };
        if (editing) await adminService.updateBanner(String(editing.id), data);
        else await adminService.createBanner(data);
      } else {
        if (!form.startDate || !form.endDate || new Date(form.endDate) <= new Date(form.startDate)) throw new Error('Choose an end date later than the start date.');
        if (form.targetType !== 'ALL' && form.targetIds.length === 0) throw new Error('Select at least one target for this promotion.');
        const data = { title: form.title.trim(), description: form.description.trim() || undefined, imageUrl: form.imageUrl || undefined, discountType: form.discountType, discountValue: Number(form.discountValue), targetType: form.targetType, targetIds: form.targetType === 'ALL' ? [] : form.targetIds, startDate: new Date(form.startDate).toISOString(), endDate: new Date(form.endDate).toISOString(), isActive: form.isActive };
        if (editing) await adminService.updatePromotion(String(editing.id), data);
        else await adminService.createPromotion(data);
      }
      setDialogOpen(false); setNotice(`${tab === 'banners' ? 'Banner' : 'Promotion'} ${editing ? 'updated' : 'created'}.`); await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not save this content.'); }
    finally { setWorking(false); }
  };

  const deleteRecord = async (record: ContentRecord) => {
    if (!window.confirm(`Delete “${String(record.title ?? 'this item')}”?`)) return;
    setWorking(true); setError(''); setNotice('');
    try {
      if (record._recordType === 'Banner') await adminService.deleteBanner(String(record.id));
      else await adminService.deletePromotion(String(record.id));
      setNotice(`${record._recordType} deleted.`); await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not delete this content.'); }
    finally { setWorking(false); }
  };

  const saveSettingFields = async (fields: SettingField[]) => {
    setWorking(true); setError(''); setNotice('');
    try {
      if (fields === heroFields) {
        const destination = settingsForm['cms.home.hero.secondary_link']?.trim() || '/shop';
        if (!destination.startsWith('/') || destination.startsWith('//') || /[\\\x00-\x1f]/.test(destination)) throw new Error('The second button destination must be a page on this site, such as /shop.');
      }
      await Promise.all(fields.map((field) => adminService.updateSetting(field.key, settingsForm[field.key] ?? '', field.label)));
      setNotice('Website content saved.');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not save website content.'); }
    finally { setWorking(false); }
  };

  const toggleFeatured = (id: string) => setFeaturedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 6 ? [...current, id] : current);
  const saveFeatured = async () => {
    setWorking(true); setError(''); setNotice('');
    try {
      await adminService.updateSetting('cms.featured_product_ids', JSON.stringify(featuredIds), 'Product IDs displayed in the storefront featured products section');
      setNotice('Featured products saved.');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not save featured products.'); }
    finally { setWorking(false); }
  };

  const uploadImage = async (file?: File) => {
    if (!file) return;
    setWorking(true); setError('');
    try { const result = await adminService.uploadCmsImage(file); setForm((current) => ({ ...current, imageUrl: result.imageUrl })); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not upload this image.'); }
    finally { setWorking(false); }
  };

  const optionsForTarget = form.targetType === 'BRAND' ? brands : form.targetType === 'CATEGORY' ? categories : products;

  const renderSettings = (fields: SettingField[]) => <div className="grid gap-4 md:grid-cols-2">{fields.map((field) => <label key={field.key} className={`block text-xs font-medium text-slate-700 ${field.multiline ? "md:col-span-2" : ""}`}>{field.label}{field.multiline ? <textarea rows={4} value={settingsForm[field.key] ?? ""} onChange={(event) => setSettingsForm((current) => ({ ...current, [field.key]: event.target.value }))} className="mt-1 block w-full rounded border border-slate-200 px-3 py-2 text-sm outline-none focus:border-amber-500"/> : <input type={field.type ?? "text"} value={settingsForm[field.key] ?? ""} onChange={(event) => setSettingsForm((current) => ({ ...current, [field.key]: event.target.value }))} className="mt-1 block w-full rounded border border-slate-200 px-3 py-2 text-sm outline-none focus:border-amber-500"/>}</label>)}</div>;
  const uploadAboutImage = async (file?: File) => {
    if (!file) return;
    setWorking(true); setError("");
    try { const result = await adminService.uploadCmsImage(file); setSettingsForm((current) => ({ ...current, "cms.about.image": result.imageUrl })); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not upload the About page image."); }
    finally { setWorking(false); }
  };
  const pageTitle = 'Website Content';
  return <div className="mx-auto max-w-[1500px] space-y-5">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-2xl font-bold text-slate-900">{pageTitle}</h1><p className="mt-1 text-sm text-slate-600">Manage content displayed on the website.</p></div>
      {(tab === 'banners' || tab === 'promotions') && <button onClick={openCreate} className="inline-flex h-10 items-center gap-2 rounded-md bg-amber-600 px-4 text-xs font-semibold text-white hover:bg-amber-700"><Plus size={15}/>Add New {tab === 'banners' ? 'Banner' : 'Promotion'}</button>}
    </header>
    <nav className="flex gap-5 overflow-x-auto border-b border-slate-200">{tabs.map((item) => <button key={item.key} onClick={() => { setTab(item.key); setSearch(''); setError(''); setNotice(''); }} className={`shrink-0 border-b-2 px-1 py-3 text-xs font-semibold ${tab === item.key ? 'border-amber-600 text-amber-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>{item.label}</button>)}</nav>
    {error && <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}{notice && <div role="status" className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</div>}
    {loading ? <div className={`${panel} p-12 text-center text-sm text-slate-500`}>Loading website content…</div> : <>
      {tab === 'banners' && <section className={`${panel} p-5`}><div className="mb-5 flex flex-wrap items-center justify-between gap-2"><div><h2 className="text-sm font-semibold">Home page banner text</h2><p className="mt-1 text-xs text-slate-500">The newest active banner supplies the main heading, image and first button destination. The fields below control the other text on that banner.</p></div><a href="/" target="_blank" rel="noreferrer" className="text-xs font-semibold text-amber-700 underline">View home page</a></div>{renderSettings(heroFields)}<p className="mt-3 text-xs text-slate-500">The second active banner appears below featured products when no promotion is active. When a promotion has no image, that banner supplies its background. Further banners are saved but are not displayed.</p><div className="mt-5 flex justify-end"><button disabled={working || !contentReady} onClick={() => void saveSettingFields(heroFields)} className="rounded bg-amber-600 px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50">Save banner text</button></div></section>}
      {(tab === 'banners' || tab === 'promotions') && <section className={panel}>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-sm font-semibold text-slate-900">{tab === 'banners' ? 'Banners' : 'Promotions'}</h2><p className="mt-1 text-xs text-slate-500">{visibleRecords.length} shown · {activeCount} active items</p></div><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${tab}…`} className="h-9 w-full rounded border border-slate-200 px-3 text-xs outline-none focus:border-amber-500 sm:max-w-xs"/></div>
        {visibleRecords.length ? <div className="divide-y divide-slate-100">{visibleRecords.map((record) => <article key={String(record.id)} className="grid gap-3 p-4 sm:grid-cols-[130px_minmax(0,1fr)_auto] sm:items-center">
          {record.imageUrl ? <div className="h-[82px] w-full overflow-hidden rounded border border-slate-100 bg-slate-50 sm:w-[130px]"><img src={resolveCmsImageUrl(record.imageUrl)} alt={String(record.title ?? 'Content image')} className="h-full w-full object-cover"/></div> : <div className="grid h-[82px] w-full place-items-center rounded bg-amber-50 text-xs font-bold text-amber-700 sm:w-[130px]">{record._recordType.toUpperCase()}</div>}
          <div className="min-w-0"><h3 className="truncate text-sm font-semibold text-slate-800">{String(record.title ?? 'Untitled')}</h3><p className="mt-1 line-clamp-2 text-xs text-slate-500">{record._recordType === 'Banner' ? String(record.linkUrl || 'No destination link') : String(record.description || `${String(record.discountValue ?? '')} ${String(record.discountType ?? '')}`)}</p>{record._recordType === 'Banner' && <p className="mt-1 text-[11px] text-slate-500">{record.isActive !== true ? 'Not displayed: inactive' : activeBanners.findIndex((banner) => banner.id === record.id) === 0 ? 'Home page: main banner' : activeBanners.findIndex((banner) => banner.id === record.id) === 1 ? 'Home page: secondary banner or fallback promotion background' : 'Not displayed: more than two active banners'}</p>}{record._recordType === 'Promotion' && <p className="mt-1 text-[11px] text-slate-400">{localInputDate(record.startDate).slice(0, 10)} – {localInputDate(record.endDate).slice(0, 10)}</p>}</div>
          <div className="flex items-center justify-between gap-2 sm:justify-end"><span className={`rounded px-2 py-1 text-[10px] font-semibold ${record.isActive === true ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{record.isActive === true ? 'Active' : 'Inactive'}</span>{record._recordType === 'Banner' && Boolean(record.linkUrl) && <a href={String(record.linkUrl)} target="_blank" rel="noreferrer" aria-label="Preview banner link" className="rounded border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"><Eye size={15}/></a>}<button onClick={() => openEdit(record)} aria-label={`Edit ${String(record.title)}`} className="rounded border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"><Pencil size={15}/></button><button disabled={working} onClick={() => void deleteRecord(record)} aria-label={`Delete ${String(record.title)}`} className="rounded border border-slate-200 p-2 text-slate-600 hover:border-red-200 hover:text-red-600"><Trash2 size={15}/></button></div>
        </article>)}</div> : <div className="p-12 text-center text-sm text-slate-500">No {tab} yet. Add one to publish website content.</div>}
        <footer className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500">Showing {visibleRecords.length} of {records.filter((record) => record._recordType.toLowerCase() === (tab === 'banners' ? 'banner' : 'promotion')).length} {tab}</footer>
      </section>}
      {tab === 'featured' && <section className={panel}><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4"><div><h2 className="text-sm font-semibold">Featured products</h2><p className="mt-1 text-xs text-slate-500">Choose up to six catalogue products for the home page.</p></div><button disabled={working} onClick={() => void saveFeatured()} className="rounded bg-amber-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">Save selection</button></div><div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">{products.map((product) => { const id = String(product.id); return <label key={id} className="flex cursor-pointer items-center gap-3 rounded border border-slate-200 p-3 hover:border-amber-400"><input type="checkbox" checked={featuredIds.includes(id)} onChange={() => toggleFeatured(id)} disabled={!featuredIds.includes(id) && featuredIds.length >= 6} className="accent-amber-600"/><span className="min-w-0 flex-1"><strong className="block truncate text-xs">{String(product.name ?? 'Product')}</strong><span className="mt-1 block text-[11px] text-slate-500">{Number(product.price ?? 0).toLocaleString()} XAF · {String(product.status ?? '')}</span></span></label>; })}{!products.length && <p className="py-10 text-center text-sm text-slate-500">No catalogue products available.</p>}</div><div className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500">{featuredIds.length} of 6 selected</div></section>}
      {tab === 'about' && <section className={`${panel} p-5`}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2"><div><h2 className="text-sm font-semibold">About Us page</h2><p className="mt-1 text-xs text-slate-500">Edit the heading, story, image and four commitment cards shown on the About Us page. Separate paragraphs with a blank line.</p></div><a href="/about" target="_blank" rel="noreferrer" className="text-xs font-semibold text-amber-700 underline">View About Us page</a></div>
        {renderSettings(aboutFields)}
        <div className="mt-4"><label className="block text-xs font-medium text-slate-700">Upload About page image<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => void uploadAboutImage(event.target.files?.[0])} className="mt-1 block w-full text-xs"/></label>{settingsForm["cms.about.image"] && <img src={resolveCmsImageUrl(settingsForm["cms.about.image"])} alt="About page preview" className="mt-3 h-36 w-48 rounded border object-cover"/>}</div>
        <div className="mt-5 flex justify-end"><button disabled={working || !contentReady} onClick={() => void saveSettingFields(aboutFields)} className="rounded bg-amber-600 px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50">Save changes</button></div>
      </section>}
      {tab === 'contact' && <section className={`${panel} p-5`}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2"><div><h2 className="text-sm font-semibold">Contact page</h2><p className="mt-1 text-xs text-slate-500">These fields match the text on the Contact page. The address also controls its map and directions; the phone also appears on receipts.</p></div><a href="/contact" target="_blank" rel="noreferrer" className="text-xs font-semibold text-amber-700 underline">View Contact page</a></div>
        {renderSettings(contactFields)}
        <div className="mt-5 flex justify-end"><button disabled={working || !contentReady} onClick={() => void saveSettingFields(contactFields)} className="rounded bg-amber-600 px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50">Save changes</button></div>
      </section>}
    </>}
    {dialogOpen && (
      <div className="fixed inset-0 z-[70] grid place-items-center bg-black/40 p-4">
        <form onSubmit={(event) => void saveRecord(event)} className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-lg bg-white shadow-xl">
          <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div><h2 className="text-base font-bold">{editing ? 'Edit' : 'Add'} {tab === 'banners' ? 'Banner' : 'Promotion'}</h2><p className="mt-1 text-xs text-slate-500">Changes are saved to the website content records.</p></div>
            <button type="button" onClick={() => setDialogOpen(false)} aria-label="Close" className="rounded p-2 hover:bg-slate-100"><X size={17}/></button>
          </header>
          <div className="space-y-4 p-5">
            <label className="block text-xs font-semibold">{tab === 'banners' ? 'Banner heading' : 'Title'}<input required value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className="mt-1 block w-full rounded border border-slate-200 px-3 py-2.5 text-sm font-normal"/></label>
            <label className="block text-xs font-semibold">Upload image from your computer<input required={!form.imageUrl} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => void uploadImage(event.target.files?.[0])} className="mt-1 block w-full rounded border border-slate-200 p-2 text-xs font-normal"/><span className="mt-1 block font-normal text-slate-500">JPG, PNG, WebP or GIF · up to 5 MB</span></label>
            {form.imageUrl && <img src={resolveCmsImageUrl(form.imageUrl)} alt="Content image preview" className="max-h-44 w-full rounded border border-slate-100 object-cover"/>}
            {tab === 'banners' ? (
              <label className="block text-xs font-semibold">Button destination<select required value={form.linkUrl} onChange={(event) => setForm((current) => ({ ...current, linkUrl: event.target.value }))} className="mt-1 block w-full rounded border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal"><option value="">Select destination</option><option value="/">Home page</option><option value="/shop">Shop page</option><option value="/promotions">Promotions page</option><option value="/about">About Us</option><option value="/contact">Contact</option>{form.linkUrl && !['/', '/shop', '/promotions', '/about', '/contact'].includes(form.linkUrl) && <option value={form.linkUrl}>Current saved destination</option>}</select></label>
            ) : (
              <>
                <label className="block text-xs font-semibold">Description<textarea rows={3} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="mt-1 block w-full rounded border border-slate-200 px-3 py-2.5 text-sm font-normal"/></label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-xs font-semibold">Discount type<select value={form.discountType} onChange={(event) => setForm((current) => ({ ...current, discountType: event.target.value }))} className="mt-1 block w-full rounded border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal"><option value="PERCENTAGE">Percentage</option><option value="FIXED_AMOUNT">Fixed amount (XAF)</option></select></label>
                  <label className="block text-xs font-semibold">Discount value<input required type="number" min="0.01" step="0.01" max={form.discountType === 'PERCENTAGE' ? 100 : undefined} value={form.discountValue} onChange={(event) => setForm((current) => ({ ...current, discountValue: event.target.value }))} className="mt-1 block w-full rounded border border-slate-200 px-3 py-2.5 text-sm font-normal"/></label>
                </div>
                <label className="block text-xs font-semibold">Apply promotion to<select value={form.targetType} onChange={(event) => setForm((current) => ({ ...current, targetType: event.target.value, targetIds: [] }))} className="mt-1 block w-full rounded border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal"><option value="ALL">All products</option><option value="BRAND">Selected brands</option><option value="CATEGORY">Selected categories</option><option value="PRODUCT">Selected products</option></select></label>
                {form.targetType !== 'ALL' && <div className="max-h-40 space-y-2 overflow-y-auto rounded border border-slate-200 p-3">{optionsForTarget.map((option) => { const id = String(option.id); return <label key={id} className="flex items-center gap-2 text-xs font-normal"><input type="checkbox" checked={form.targetIds.includes(id)} onChange={() => setForm((current) => ({ ...current, targetIds: current.targetIds.includes(id) ? current.targetIds.filter((selectedId) => selectedId !== id) : [...current.targetIds, id] }))} className="accent-amber-600"/><span>{String(option.name ?? 'Unnamed')}</span></label>; })}{!optionsForTarget.length && <p className="text-xs text-slate-500">No matching options found.</p>}</div>}
                <div className="grid gap-3 sm:grid-cols-2"><label className="block text-xs font-semibold">Starts<input required type="datetime-local" value={form.startDate} onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))} className="mt-1 block w-full rounded border border-slate-200 px-3 py-2.5 text-sm font-normal"/></label><label className="block text-xs font-semibold">Ends<input required type="datetime-local" min={form.startDate || undefined} value={form.endDate} onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))} className="mt-1 block w-full rounded border border-slate-200 px-3 py-2.5 text-sm font-normal"/></label></div>
              </>
            )}
            <label className="flex items-center gap-2 text-xs font-medium"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))} className="accent-amber-600"/>Active on the website</label>
            {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
          </div>
          <footer className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4"><button type="button" onClick={() => setDialogOpen(false)} className="rounded border border-slate-200 px-4 py-2 text-xs font-semibold">Cancel</button><button disabled={working} className="rounded bg-amber-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">{working ? 'Saving…' : editing ? 'Save changes' : 'Create'}</button></footer>
        </form>
      </div>
    )}
  </div>;
}
