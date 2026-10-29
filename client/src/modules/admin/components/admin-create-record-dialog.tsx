'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { adminService } from '../services/admin.service';
import { AdminRecord, AdminSection } from '../types/admin.types';

type RecordKind = 'Category' | 'Brand' | 'Banner' | 'Promotion';

export function AdminCreateRecordDialog({ section, onClose, onCreated }: { section: AdminSection; onClose: () => void; onCreated: () => void }) {
  const [kind, setKind] = useState<RecordKind>(section === 'categories-brands' ? 'Category' : section === 'cms' ? 'Banner' : 'Brand');
  const [categories, setCategories] = useState<AdminRecord[]>([]);
  const [brands, setBrands] = useState<AdminRecord[]>([]);
  const [form, setForm] = useState<Record<string, string>>({ status: 'ACTIVE', discountType: 'PERCENTAGE' });
  const [mainProductImage, setMainProductImage] = useState<File | null>(null);
  const [thumbnailImages, setThumbnailImages] = useState<File[]>([]);
  const [mainImageSource, setMainImageSource] = useState<'upload' | 'url'>('upload');
  const [mainImageUrl, setMainImageUrl] = useState('');
  const [thumbnailSource, setThumbnailSource] = useState<'upload' | 'url'>('upload');
  const [thumbnailUrls, setThumbnailUrls] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (section === 'products') void Promise.all([adminService.getCategories(), adminService.getBrands()]).then(([nextCategories, nextBrands]) => { setCategories(nextCategories); setBrands(nextBrands); }).catch((cause) => setError(cause instanceof Error ? cause.message : 'Could not load product options.'));
  }, [section]);
  const set = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const field = (key: string, label: string, type = 'text', required = false) => <label key={key} className="block text-xs font-semibold">{label}<input required={required} type={type} value={form[key] ?? ''} onChange={(event) => set(key, event.target.value)} className="mt-1 block w-full border border-neutral-300 px-3 py-2 text-sm font-normal outline-none focus:border-[#D4AF37]"/></label>;
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setError(''); setSaving(true);
    try {
      if (section === 'products') {
        const created = await adminService.createProduct({ ...form, status: 'INACTIVE', price: Number(form.price) });
        const productId = String(created.id);
        const createdVariant = await adminService.createProductVariant(productId, {
          sku: form.sku.trim(), size: form.size || undefined, color: form.color || undefined,
          price: Number(form.price), status: 'ACTIVE',
        });
        const initialStock = Number(form.initialStock || 0);
        if (initialStock > 0) await adminService.createInventoryMovement({ variantId: String(createdVariant.id), quantity: initialStock, movementType: 'STOCK_IN', reference: 'Initial product stock' });
        if (mainImageSource === 'upload' && mainProductImage) await adminService.uploadProductImage(productId, mainProductImage, `${form.name} main product image`, true);
        if (mainImageSource === 'url' && mainImageUrl.trim()) await adminService.uploadProductImage(productId, undefined, `${form.name} main product image`, true, mainImageUrl.trim());
        for (const [index, image] of thumbnailImages.entries()) await adminService.uploadProductImage(productId, image, `${form.name} product thumbnail ${index + 1}`);
        for (const [index, url] of thumbnailUrls.split(/\r?\n/).map((value) => value.trim()).filter(Boolean).entries()) await adminService.uploadProductImage(productId, undefined, `${form.name} product thumbnail ${index + 1}`, false, url);
        await adminService.updateProduct(productId, { status: form.status });
      }
      else if (section === 'categories-brands') {
        const payload = { name: form.name, description: form.description || undefined };
        if (kind === 'Category') await adminService.createCategory(payload); else await adminService.createBrand(payload);
      } else if (section === 'cms' && kind === 'Banner') {
        await adminService.createBanner({ title: form.title, imageUrl: form.imageUrl, linkUrl: form.linkUrl || undefined, isActive: true });
      } else if (section === 'cms') {
        await adminService.createPromotion({ title: form.title, description: form.description, discountType: form.discountType, discountValue: Number(form.discountValue), startDate: new Date(form.startDate).toISOString(), endDate: new Date(form.endDate).toISOString(), isActive: true });
      }
      onCreated();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not create this record.'); }
    finally { setSaving(false); }
  };
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"><form onSubmit={save} className="max-h-[90vh] w-full max-w-xl overflow-y-auto border border-neutral-200 bg-white shadow-xl"><header className="flex items-center justify-between border-b border-neutral-200 px-5 py-4"><div><p className="text-[10px] font-semibold uppercase tracking-widest text-[#966800]">Administration</p><h2 className="mt-1 font-bold">{section === 'products' ? 'Add product' : section === 'cms' ? 'Add website content' : 'Add category or brand'}</h2></div><button type="button" aria-label="Close" onClick={onClose}><X size={18}/></button></header>
    <div className="space-y-4 p-5">
      {section !== 'products' && <label className="block text-xs font-semibold">Record type<select value={kind} onChange={(event) => setKind(event.target.value as RecordKind)} className="mt-1 block w-full border border-neutral-300 bg-white px-3 py-2 text-sm">{section === 'categories-brands' ? <><option>Category</option><option>Brand</option></> : <><option>Banner</option><option>Promotion</option></>}</select></label>}
      {section === 'products' && <><label className="block text-xs font-semibold">Category<select required value={form.categoryId ?? ''} onChange={(event) => set('categoryId', event.target.value)} className="mt-1 block w-full border border-neutral-300 bg-white px-3 py-2 text-sm"><option value="">Select category</option>{categories.map((item) => <option key={String(item.id)} value={String(item.id)}>{String(item.name)}</option>)}</select></label><label className="block text-xs font-semibold">Brand<select required value={form.brandId ?? ''} onChange={(event) => set('brandId', event.target.value)} className="mt-1 block w-full border border-neutral-300 bg-white px-3 py-2 text-sm"><option value="">Select brand</option>{brands.map((item) => <option key={String(item.id)} value={String(item.id)}>{String(item.name)}</option>)}</select></label>{field('name', 'Product name', 'text', true)}{field('description', 'Description')}{field('price', 'Price (XAF)', 'number', true)}<section className="space-y-3 border-t border-neutral-100 pt-3"><h3 className="text-xs font-bold">First product variant</h3><p className="text-[10px] font-normal text-neutral-500">Add a SKU so customers can order this product. Initial stock is recorded as an inventory movement.</p>{field('sku', 'SKU', 'text', true)}<div className="grid gap-3 sm:grid-cols-2">{field('size', 'Size')}{field('color', 'Color')}{field('initialStock', 'Initial stock quantity', 'number')}</div></section><section className="space-y-3 border-t border-neutral-100 pt-3"><div><h3 className="text-xs font-bold">Main product image <span className="text-red-600">*</span></h3><p className="mt-1 text-[10px] font-normal text-neutral-500">Required. Shown as the main storefront image.</p></div><div className="flex gap-2"><button type="button" onClick={() => setMainImageSource('upload')} className={`border px-3 py-2 text-xs ${mainImageSource === 'upload' ? 'border-[#b4830b] bg-amber-50 font-semibold' : 'border-neutral-200'}`}>Upload from PC</button><button type="button" onClick={() => setMainImageSource('url')} className={`border px-3 py-2 text-xs ${mainImageSource === 'url' ? 'border-[#b4830b] bg-amber-50 font-semibold' : 'border-neutral-200'}`}>Use image URL</button></div>{mainImageSource === 'upload' ? <input required type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => setMainProductImage(event.target.files?.[0] ?? null)} className="block w-full text-xs"/> : <input required type="url" value={mainImageUrl} onChange={(event) => setMainImageUrl(event.target.value)} placeholder="https://example.com/product-image.jpg" className="block w-full border border-neutral-300 px-3 py-2 text-xs"/>}</section><section className="space-y-3 border-t border-neutral-100 pt-3"><div><h3 className="text-xs font-bold">Thumbnail images <span className="font-normal text-neutral-500">(optional)</span></h3><p className="mt-1 text-[10px] font-normal text-neutral-500">Shown below the main image on the product detail page.</p></div><div className="flex gap-2"><button type="button" onClick={() => setThumbnailSource('upload')} className={`border px-3 py-2 text-xs ${thumbnailSource === 'upload' ? 'border-[#b4830b] bg-amber-50 font-semibold' : 'border-neutral-200'}`}>Upload from PC</button><button type="button" onClick={() => setThumbnailSource('url')} className={`border px-3 py-2 text-xs ${thumbnailSource === 'url' ? 'border-[#b4830b] bg-amber-50 font-semibold' : 'border-neutral-200'}`}>Use image URL</button></div>{thumbnailSource === 'upload' ? <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => setThumbnailImages(Array.from(event.target.files ?? []))} className="block w-full text-xs"/> : <textarea rows={3} value={thumbnailUrls} onChange={(event) => setThumbnailUrls(event.target.value)} placeholder="Paste one image URL per line" className="block w-full border border-neutral-300 px-3 py-2 text-xs"/>}</section><label className="block text-xs font-semibold">Storefront status<select value={form.status ?? 'ACTIVE'} onChange={(event) => set('status', event.target.value)} className="mt-1 block w-full border border-neutral-300 bg-white px-3 py-2 text-sm"><option>ACTIVE</option><option>INACTIVE</option></select></label></>}
      {section === 'categories-brands' && <>{field('name', `${kind} name`, 'text', true)}{field('description', 'Description')}</>}
      {section === 'cms' && kind === 'Banner' && <>{field('title', 'Title', 'text', true)}{field('imageUrl', 'Image URL', 'url', true)}{field('linkUrl', 'Destination link', 'url')}</>}
      {section === 'cms' && kind === 'Promotion' && <>{field('title', 'Title', 'text', true)}{field('description', 'Description')}{field('discountValue', 'Discount value', 'number', true)}<label className="block text-xs font-semibold">Discount type<select value={form.discountType ?? 'PERCENTAGE'} onChange={(event) => set('discountType', event.target.value)} className="mt-1 block w-full border border-neutral-300 bg-white px-3 py-2 text-sm"><option value="PERCENTAGE">Percentage</option><option value="FIXED_AMOUNT">Fixed amount (XAF)</option></select></label>{field('startDate', 'Starts', 'datetime-local', true)}{field('endDate', 'Ends', 'datetime-local', true)}</>}
      {error && <p className="text-xs text-red-700">{error}</p>}
    </div><footer className="flex justify-end gap-2 border-t border-neutral-200 px-5 py-4"><button type="button" onClick={onClose} className="border border-neutral-300 px-4 py-2 text-xs font-semibold">Cancel</button><button disabled={saving} className="bg-[#D4AF37] px-4 py-2 text-xs font-bold text-black disabled:opacity-50">{saving ? 'Saving…' : 'Create record'}</button></footer>
  </form></div>;
}
