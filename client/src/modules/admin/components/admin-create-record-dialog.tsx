'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { adminService } from '../services/admin.service';
import { AdminRecord, AdminSection } from '../types/admin.types';

type RecordKind = 'Category' | 'Brand' | 'Banner' | 'Promotion';

export function AdminCreateRecordDialog({ section, onClose, onCreated, initialKind }: { section: AdminSection; onClose: () => void; onCreated: () => void; initialKind?: 'Category' | 'Brand' }) {
  const [kind, setKind] = useState<RecordKind>(initialKind ?? (section === 'categories-brands' ? 'Category' : section === 'cms' ? 'Banner' : 'Brand'));
  const [categories, setCategories] = useState<AdminRecord[]>([]);
  const [brands, setBrands] = useState<AdminRecord[]>([]);
  const [colorOptions, setColorOptions] = useState<AdminRecord[]>([]);
  const [editionOptions, setEditionOptions] = useState<AdminRecord[]>([]);
  const [optionManagerType, setOptionManagerType] = useState<'COLOR' | 'EDITION' | null>(null);
  const [optionName, setOptionName] = useState('');
  const [editingOptionId, setEditingOptionId] = useState('');
  const [optionSaving, setOptionSaving] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({ status: 'ACTIVE', discountType: 'PERCENTAGE' });
  const [mainProductImage, setMainProductImage] = useState<File | null>(null);
  const [mainImageSource, setMainImageSource] = useState<'upload' | 'url'>('upload');
  const [mainImageUrl, setMainImageUrl] = useState('');
  const [gallerySlots, setGallerySlots] = useState([
    { source: 'upload' as 'upload' | 'url', file: null as File | null, url: '' },
    { source: 'upload' as 'upload' | 'url', file: null as File | null, url: '' },
    { source: 'upload' as 'upload' | 'url', file: null as File | null, url: '' },
    { source: 'upload' as 'upload' | 'url', file: null as File | null, url: '' },
  ]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (section === 'products') void Promise.all([adminService.getCategories(), adminService.getBrands(), adminService.getProductOptions('COLOR'), adminService.getProductOptions('EDITION')]).then(([nextCategories, nextBrands, nextColors, nextEditions]) => { setCategories(nextCategories); setBrands(nextBrands); setColorOptions(nextColors); setEditionOptions(nextEditions); }).catch((cause) => setError(cause instanceof Error ? cause.message : 'Could not load product options.'));
  }, [section]);
  const set = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const field = (key: string, label: string, type = 'text', required = false) => <label key={key} className="block text-xs font-semibold">{label}<input required={required} type={type} value={form[key] ?? ''} onChange={(event) => set(key, event.target.value)} className="mt-1 block w-full border border-neutral-300 px-3 py-2 text-sm font-normal outline-none focus:border-[#D4AF37]"/></label>;
  const refreshProductOptions = async (type: 'COLOR' | 'EDITION') => {
    const options = await adminService.getProductOptions(type);
    if (type === 'COLOR') setColorOptions(options);
    else setEditionOptions(options);
  };

  const saveProductOption = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!optionManagerType) return;
    if (!optionName.trim()) {
      setError('Enter an option name.');
      return;
    }

    setOptionSaving(true);
    setError('');
    try {
      if (editingOptionId) {
        await adminService.updateProductOption(editingOptionId, optionName.trim());
      } else {
        await adminService.createProductOption(optionManagerType, optionName.trim());
      }
      await refreshProductOptions(optionManagerType);
      setOptionName('');
      setEditingOptionId('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save this option.');
    } finally {
      setOptionSaving(false);
    }
  };

  const deleteProductOption = async (id: string) => {
    if (!optionManagerType) return;
    setError('');
    try {
      await adminService.deleteProductOption(id);
      await refreshProductOptions(optionManagerType);
      if (editingOptionId === id) {
        setEditingOptionId('');
        setOptionName('');
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not delete this option.');
    }
  };
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setError(''); setSaving(true);
    try {
      if (section === 'products') {
        if (!form.name?.trim()) throw new Error('Enter a product name.');
        if (!form.categoryId) throw new Error('Select a category.');
        if (!form.brandId) throw new Error('Select a brand.');
        if (!form.price || !Number.isFinite(Number(form.price)) || Number(form.price) <= 0) throw new Error('Enter a valid product price.');
        if (mainImageSource === 'upload' && !mainProductImage) throw new Error('Upload the required main product image.');
        if (mainImageSource === 'url' && !mainImageUrl.trim()) throw new Error('Enter the main product image URL.');
        const initialStock = Number(form.initialStock || 0);
        if (!Number.isSafeInteger(initialStock) || initialStock < 0) {
          throw new Error('Initial stock must be a non-negative whole number.');
        }
        const created = await adminService.createProduct({ name: form.name.trim(), description: form.description || undefined, categoryId: form.categoryId, brandId: form.brandId, price: Number(form.price), status: 'INACTIVE' });
        const productId = String(created.id);
        const createdVariant = await adminService.createProductVariant(productId, {
          size: form.size || undefined, color: form.color || undefined, edition: form.edition || undefined,
          price: Number(form.price), status: 'ACTIVE',
        });
        if (initialStock > 0) await adminService.createInventoryMovement({ variantId: String(createdVariant.id), quantity: initialStock, movementType: 'STOCK_IN', reference: 'Initial product stock' });
        if (mainImageSource === 'upload' && mainProductImage) await adminService.uploadProductImage(productId, mainProductImage, `${form.name} main product image`, true);
        if (mainImageSource === 'url' && mainImageUrl.trim()) await adminService.uploadProductImage(productId, undefined, `${form.name} main product image`, true, mainImageUrl.trim());
        for (const [index, slot] of gallerySlots.entries()) {
          if (slot.source === 'upload' && slot.file) {
            await adminService.uploadProductImage(productId, slot.file, `${form.name} product thumbnail ${index + 1}`);
          } else if (slot.source === 'url' && slot.url.trim()) {
            await adminService.uploadProductImage(productId, undefined, `${form.name} product thumbnail ${index + 1}`, false, slot.url.trim());
          }
        }        await adminService.updateProduct(productId, { status: form.status });
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
      {section === 'categories-brands' ? <p className="text-sm font-semibold text-neutral-700">Record type: {kind}</p> : section !== 'products' && <label className="block text-xs font-semibold">Record type<select value={kind} onChange={(event) => setKind(event.target.value as RecordKind)} className={"mt-1 block w-full border border-neutral-300 bg-white px-3 py-2 text-sm"}><option>Banner</option><option>Promotion</option></select></label>}
      {section === 'products' && <><label className="block text-xs font-semibold">Category<select required value={form.categoryId ?? ''} onChange={(event) => set('categoryId', event.target.value)} className="mt-1 block w-full border border-neutral-300 bg-white px-3 py-2 text-sm"><option value="">Select category</option>{categories.map((item) => <option key={String(item.id)} value={String(item.id)}>{String(item.name)}</option>)}</select></label><label className="block text-xs font-semibold">Brand<select required value={form.brandId ?? ''} onChange={(event) => set('brandId', event.target.value)} className="mt-1 block w-full border border-neutral-300 bg-white px-3 py-2 text-sm"><option value="">Select brand</option>{brands.map((item) => <option key={String(item.id)} value={String(item.id)}>{String(item.name)}</option>)}</select></label>{field('name', 'Product name', 'text', true)}{field('description', 'Description')}{field('price', 'Price (XAF)', 'number', true)}<section className="space-y-3 border-t border-neutral-100 pt-3"><h3 className="text-xs font-bold">First product variant</h3><p className="text-[10px] font-normal text-neutral-500">The system generates a unique SKU automatically. Initial stock is recorded as an inventory movement.</p><div className="grid gap-3 sm:grid-cols-2"><label className="block text-xs font-semibold">Size<select value={form.size ?? ""} onChange={(event) => set("size", event.target.value)} className="mt-1 block w-full border border-neutral-300 bg-white px-3 py-2 text-sm"><option value="">Select size</option>{["XS", "S", "M", "L", "XL", "XXL", "XXXL", "4XL", "5XL", "One Size"].map((size) => <option key={size} value={size}>{size}</option>)}</select></label><div><label className="block text-xs font-semibold">Color</label><div className="mt-1 flex gap-2"><select value={form.color ?? ""} onChange={(event) => set("color", event.target.value)} className="min-w-0 flex-1 border border-neutral-300 bg-white px-3 py-2 text-sm"><option value="">Select color</option>{colorOptions.map((item) => <option key={String(item.id)} value={String(item.name)}>{String(item.name)}</option>)}</select><button type="button" onClick={() => { setOptionManagerType("COLOR"); setOptionName(""); setEditingOptionId(""); setError(""); }} className="shrink-0 border border-neutral-300 px-3 py-2 text-xs font-semibold">Manage</button></div></div><div><label className="block text-xs font-semibold">Edition</label><div className="mt-1 flex gap-2"><select value={form.edition ?? ""} onChange={(event) => set("edition", event.target.value)} className="min-w-0 flex-1 border border-neutral-300 bg-white px-3 py-2 text-sm"><option value="">Select edition</option>{editionOptions.map((item) => <option key={String(item.id)} value={String(item.name)}>{String(item.name)}</option>)}</select><button type="button" onClick={() => { setOptionManagerType("EDITION"); setOptionName(""); setEditingOptionId(""); setError(""); }} className="shrink-0 border border-neutral-300 px-3 py-2 text-xs font-semibold">Manage</button></div></div>{field('initialStock', 'Initial stock quantity', 'number')}</div></section><section className="space-y-3 border-t border-neutral-100 pt-3"><div><h3 className="text-xs font-bold">Main product image <span className="text-red-600">*</span></h3><p className="mt-1 text-[10px] font-normal text-neutral-500">Required. Shown as the main storefront image.</p></div><div className="flex gap-2"><button type="button" onClick={() => setMainImageSource('upload')} className={`border px-3 py-2 text-xs ${mainImageSource === 'upload' ? 'border-[#b4830b] bg-amber-50 font-semibold' : 'border-neutral-200'}`}>Upload from PC</button><button type="button" onClick={() => setMainImageSource('url')} className={`border px-3 py-2 text-xs ${mainImageSource === 'url' ? 'border-[#b4830b] bg-amber-50 font-semibold' : 'border-neutral-200'}`}>Use image URL</button></div>{mainImageSource === 'upload' ? <input required type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => setMainProductImage(event.target.files?.[0] ?? null)} className="block w-full text-xs"/> : <input required type="url" value={mainImageUrl ?? ''} onChange={(event) => setMainImageUrl(event.target.value)} placeholder="https://example.com/product-image.jpg" className="block w-full border border-neutral-300 px-3 py-2 text-xs"/>}</section><section className="space-y-4 border-t border-neutral-100 pt-4">
  <div>
    <h3 className="text-xs font-bold">Additional images</h3>
    <p className="mt-1 text-[10px] text-neutral-500">0–4 optional images. Add views of the back, side, label, or details. You can save without additional images.</p>
  </div>
  {gallerySlots.map((slot, index) => (
    <div key={index} className="space-y-2 rounded border border-neutral-200 p-3">
      <p className="text-xs font-semibold">Image {index + 1}</p>
      <div className="flex gap-2">
        <button type="button" onClick={() => setGallerySlots((current) => current.map((item, i) => i === index ? { ...item, source: 'upload' } : item))} className={`border px-3 py-2 text-xs ${slot.source === 'upload' ? 'border-[#b4830b] bg-amber-50 font-semibold' : 'border-neutral-200'}`}>Upload from PC</button>
        <button type="button" onClick={() => setGallerySlots((current) => current.map((item, i) => i === index ? { ...item, source: 'url' } : item))} className={`border px-3 py-2 text-xs ${slot.source === 'url' ? 'border-[#b4830b] bg-amber-50 font-semibold' : 'border-neutral-200'}`}>Use image link</button>
      </div>
      {slot.source === 'upload' ? (
        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => setGallerySlots((current) => current.map((item, i) => i === index ? { ...item, file: event.target.files?.[0] ?? null } : item))} className="block w-full text-xs" />
      ) : (
        <input type="url" value={slot.url ?? ''} onChange={(event) => setGallerySlots((current) => current.map((item, i) => i === index ? { ...item, url: event.target.value } : item))} placeholder="https://example.com/image.jpg" className="block w-full border border-neutral-300 px-3 py-2 text-xs" />
      )}
    </div>
  ))}
</section><label className="block text-xs font-semibold">Storefront status<select value={form.status ?? 'ACTIVE'} onChange={(event) => set('status', event.target.value)} className="mt-1 block w-full border border-neutral-300 bg-white px-3 py-2 text-sm"><option>ACTIVE</option><option>INACTIVE</option></select></label></>}
      {section === 'categories-brands' && <>{field('name', `${kind} name`, 'text', true)}{field('description', 'Description')}</>}
      {section === 'cms' && kind === 'Banner' && <>{field('title', 'Title', 'text', true)}{field('imageUrl', 'Image URL', 'url', true)}{field('linkUrl', 'Destination link', 'url')}</>}
      {section === 'cms' && kind === 'Promotion' && <>{field('title', 'Title', 'text', true)}{field('description', 'Description')}{field('discountValue', 'Discount value', 'number', true)}<label className="block text-xs font-semibold">Discount type<select value={form.discountType ?? 'PERCENTAGE'} onChange={(event) => set('discountType', event.target.value)} className="mt-1 block w-full border border-neutral-300 bg-white px-3 py-2 text-sm"><option value="PERCENTAGE">Percentage</option><option value="FIXED_AMOUNT">Fixed amount (XAF)</option></select></label>{field('startDate', 'Starts', 'datetime-local', true)}{field('endDate', 'Ends', 'datetime-local', true)}</>}
      {optionManagerType && <div className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-4"><section className="w-full max-w-sm border border-neutral-200 bg-white p-4 shadow-xl"><div className="mb-4 flex items-center justify-between"><h3 className="text-sm font-bold">Manage {optionManagerType === 'COLOR' ? 'colors' : 'editions'}</h3><button type="button" onClick={() => { setOptionManagerType(null); setOptionName(''); setEditingOptionId(''); setError(''); }} className="p-1" aria-label="Close option manager"><X size={16}/></button></div><div className="space-y-3"><label className="block text-xs font-semibold">{editingOptionId ? 'Rename option' : 'New option'}<input required value={optionName} onChange={(event) => setOptionName(event.target.value)} placeholder={optionManagerType === 'COLOR' ? 'e.g. Black' : 'e.g. Home Edition'} className="mt-1 block w-full border border-neutral-300 px-3 py-2 text-sm font-normal"/></label><div className="flex justify-end gap-2"><button type="button" onClick={() => { if (optionName.trim()) void saveProductOption({ preventDefault: () => {} } as React.FormEvent); else setError("Enter an option name."); }} disabled={optionSaving} className="bg-[#D4AF37] px-3 py-2 text-xs font-bold disabled:opacity-50">{optionSaving ? 'Saving...' : editingOptionId ? 'Save name' : 'Add option'}</button>{editingOptionId && <button type="button" onClick={() => { setEditingOptionId(''); setOptionName(''); }} className="border border-neutral-300 px-3 py-2 text-xs">Cancel edit</button>}</div></div><div className="mt-4 max-h-48 space-y-2 overflow-y-auto border-t border-neutral-100 pt-3">{(optionManagerType === 'COLOR' ? colorOptions : editionOptions).map((item) => <div key={String(item.id)} className="flex items-center justify-between gap-2 text-xs"><span className="min-w-0 flex-1 break-words">{String(item.name)}</span><div className="flex shrink-0 gap-2"><button type="button" onClick={() => { setEditingOptionId(String(item.id)); setOptionName(String(item.name)); setError(''); }} className="underline">Rename</button><button type="button" onClick={() => void deleteProductOption(String(item.id))} className="text-red-700 underline">Delete</button></div></div>)}{(optionManagerType === 'COLOR' ? colorOptions : editionOptions).length === 0 && <p className="text-xs text-neutral-500">No options yet. Add one above.</p>}</div>{error && <p className="mt-3 text-xs text-red-700">{error}</p>}</section></div>}
      {error && <p className="text-xs text-red-700">{error}</p>}
    </div><footer className="flex justify-end gap-2 border-t border-neutral-200 px-5 py-4"><button type="button" onClick={onClose} className="border border-neutral-300 px-4 py-2 text-xs font-semibold">Cancel</button><button disabled={saving} className="bg-[#D4AF37] px-4 py-2 text-xs font-bold text-black disabled:opacity-50">{saving ? 'Saving…' : 'Create record'}</button></footer>
  </form></div>;
}
