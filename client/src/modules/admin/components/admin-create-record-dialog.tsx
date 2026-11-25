'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { adminService } from '../services/admin.service';
import { AdminRecord, AdminSection } from '../types/admin.types';

type RecordKind = 'Category' | 'Brand' | 'Banner' | 'Promotion';
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '4XL', '5XL', 'One Size'];
const seasonOptions = Array.from({ length: 11 }, (_, index) => `${new Date().getFullYear() - 4 + index}/${new Date().getFullYear() - 3 + index}`);

export function AdminCreateRecordDialog({ section, onClose, onCreated, initialKind, product }: { section: AdminSection; onClose: () => void; onCreated: () => void; initialKind?: 'Category' | 'Brand'; product?: AdminRecord }) {
  const [kind, setKind] = useState<RecordKind>(initialKind ?? (section === 'categories-brands' ? 'Category' : section === 'cms' ? 'Banner' : 'Brand'));
  const [categories, setCategories] = useState<AdminRecord[]>([]);
  const [brands, setBrands] = useState<AdminRecord[]>([]);
  const [editionOptions, setEditionOptions] = useState<AdminRecord[]>([]);
  const [optionsNotice, setOptionsNotice] = useState('');
  const [form, setForm] = useState<Record<string, string>>({ status: 'ACTIVE', discountType: 'PERCENTAGE' });
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [stockBySize, setStockBySize] = useState<Record<string, string>>({});
  const [gallerySlots, setGallerySlots] = useState(Array.from({ length: 4 }, () => ({ source: 'upload' as 'upload' | 'url', file: null as File | null, url: '' })));
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageSource, setImageSource] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(Boolean(product));
  const [existingVariants, setExistingVariants] = useState<AdminRecord[]>([]);
  const [existingImages, setExistingImages] = useState<AdminRecord[]>([]);
  const [variantStock, setVariantStock] = useState<Record<string, string>>({});
  const [originalStock, setOriginalStock] = useState<Record<string, string>>({});
  const [saveIncomplete, setSaveIncomplete] = useState(false);

  useEffect(() => {
    if (!product) return;
    let active = true;
    setForm(Object.fromEntries(['name', 'description', 'price', 'season', 'edition', 'categoryId', 'brandId', 'status'].map((key) => [key, String(product[key] ?? '')])));
    void Promise.all([adminService.getProductVariants(String(product.id)), adminService.getProductImages(String(product.id))])
      .then(async ([variants, images]) => {
        const stocks = await Promise.all(variants.map((variant) => adminService.getInventory(String(variant.id))));
        if (!active) return;
        setExistingVariants(variants);
        setExistingImages(images);
        setSelectedSizes([...new Set(variants.map((variant) => String(variant.size || 'One Size')))]);
        const quantities = Object.fromEntries(variants.map((variant, index) => [String(variant.id), String(stocks[index].quantity ?? 0)]));
        setVariantStock(quantities);
        setOriginalStock(quantities);
        setLoadingProduct(false);
      })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : 'Could not load product details.'); });
    return () => { active = false; };
  }, [product]);

  useEffect(() => {
    if (section !== 'products') return;
    let active = true;
    void Promise.allSettled([adminService.getCategories(), adminService.getBrands(), adminService.getProductOptions('EDITION')])
      .then(([categoryResult, brandResult, editionResult]) => {
        if (!active) return;
        if (categoryResult.status === 'fulfilled') setCategories(categoryResult.value);
        else setError(categoryResult.reason instanceof Error ? categoryResult.reason.message : 'Could not load categories.');
        if (brandResult.status === 'fulfilled') setBrands(brandResult.value);
        if (editionResult.status === 'fulfilled') setEditionOptions(editionResult.value);
        if (brandResult.status === 'rejected' || editionResult.status === 'rejected') setOptionsNotice('Some optional brand or edition choices could not be loaded. You can still create a product without them.');
      });
    return () => { active = false; };
  }, [section]);

  const set = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const field = (key: string, label: string, type = 'text', required = false) => <label key={key} className="block text-xs font-semibold">{label}{required && <span className="text-red-600"> *</span>}<input required={required} type={type} value={form[key] ?? ''} onChange={(event) => set(key, event.target.value)} className="mt-1 block w-full border border-neutral-300 px-3 py-2 text-sm font-normal outline-none focus:border-[#D4AF37]" /></label>;
  const generatedDescription = () => {
    const categoryName = String(categories.find((item) => String(item.id) === form.categoryId)?.name ?? '').toLowerCase();
    const isFootballJersey = /jersey|football|kit/.test(categoryName) || Boolean(form.season || form.edition);
    if (!form.name?.trim()) return '';
    if (!isFootballJersey) return `${form.name.trim()}.`;
    const details = [form.season, form.edition].filter(Boolean).join(' · ');
    return `${form.name.trim()} football jersey${details ? ` (${details})` : ''}.`;
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setError(''); setSaving(true);
    let changesStarted = false;
    try {
      if (section === 'products') {
        if (!form.name?.trim()) throw new Error('Enter a product name.');
        if (!form.categoryId) throw new Error('Select a category.');
        if (!form.price || !Number.isFinite(Number(form.price)) || Number(form.price) <= 0) throw new Error('Enter a valid price.');
        if (!product && imageSource === 'upload' && !imageFile) throw new Error('Choose the main product image.');
        if (!product && imageSource === 'url' && !imageUrl.trim()) throw new Error('Enter the main product image URL.');
        const productSizes = product ? selectedSizes.filter((size) => !existingVariants.some((variant) => String(variant.size || 'One Size') === size)) : selectedSizes.length ? selectedSizes : ['One Size'];
        const stockEntries = productSizes.map((size) => [size, Number(stockBySize[size] ?? '')] as const);
        if (productSizes.some((size) => !stockBySize[size]?.trim())) throw new Error('Enter the initial stock quantity.');
        if (stockEntries.some(([, quantity]) => !Number.isSafeInteger(quantity) || quantity < 0) || Object.values(variantStock).some((quantity) => !quantity.trim() || !Number.isSafeInteger(Number(quantity)) || Number(quantity) < 0)) throw new Error('Enter a non-negative whole number of stock for every selected size.');
        for (const variant of existingVariants) {
          const id = String(variant.id);
          if (Number(variantStock[id]) === Number(originalStock[id])) continue;
          const current = await adminService.getInventory(id);
          if (Number(current.quantity) !== Number(originalStock[id])) throw new Error('Stock changed since this form was opened. Close and reopen the product to review the latest quantity.');
        }
        const payload = { name: form.name.trim(), description: form.description?.trim() || generatedDescription(), categoryId: form.categoryId, brandId: form.brandId || null, price: Number(form.price), season: form.season?.trim() || null, edition: form.edition?.trim() || null, status: form.status || 'ACTIVE' };
        changesStarted = true;
        const productId = product ? String(product.id) : String((await adminService.createProduct({ ...payload, brandId: payload.brandId ?? undefined, season: payload.season ?? undefined, edition: payload.edition ?? undefined })).id);
        if (product) await adminService.updateProduct(productId, payload);
        for (const variant of existingVariants) {
          const id = String(variant.id);
          const desired = Number(variantStock[id]);
          if (desired !== Number(originalStock[id])) await adminService.createInventoryMovement({ variantId: id, quantity: desired, movementType: 'ADJUSTMENT', reference: 'Product edit stock adjustment' });
        }
        for (const [size, quantity] of stockEntries) {
          const variant = await adminService.createProductVariant(productId, { size, edition: form.edition?.trim() || undefined, price: Number(form.price), status: 'ACTIVE' });
          if (quantity > 0) await adminService.createInventoryMovement({ variantId: String(variant.id), quantity, movementType: 'STOCK_IN', reference: 'Initial product stock' });
        }
        if (imageSource === 'upload' && imageFile) await adminService.uploadProductImage(productId, imageFile, `${form.name.trim()} main product image`, true);
        else if (imageSource === 'url' && imageUrl.trim()) await adminService.uploadProductImage(productId, undefined, `${form.name.trim()} main product image`, true, imageUrl.trim());
        await Promise.all(gallerySlots.flatMap((slot, index) => {
          if (slot.source === 'upload' && slot.file) return [adminService.uploadProductImage(productId, slot.file, `${form.name.trim()} product view ${index + 1}`)];
          if (slot.source === 'url' && slot.url.trim()) return [adminService.uploadProductImage(productId, undefined, `${form.name.trim()} product view ${index + 1}`, false, slot.url.trim())];
          return [];
        }));
      } else if (section === 'categories-brands') {
        let categoryImage = imageUrl.trim() || undefined;
        if (kind === 'Category' && imageSource === 'upload') {
          if (!imageFile) throw new Error('Choose a category image.');
          categoryImage = (await adminService.uploadCmsImage(imageFile)).imageUrl;
        } else if (kind === 'Category' && imageSource === 'url' && !categoryImage) {
          throw new Error('Enter a category image URL.');
        }
        const payload = { name: form.name?.trim(), description: form.description || undefined };
        if (kind === 'Category') await adminService.createCategory({ ...payload, imageUrl: categoryImage });
        else await adminService.createBrand(payload);
      } else if (section === 'cms' && kind === 'Banner') {
        await adminService.createBanner({ title: form.title, imageUrl: form.imageUrl, linkUrl: form.linkUrl || undefined, isActive: true });
      } else if (section === 'cms') {
        await adminService.createPromotion({ title: form.title, description: form.description, discountType: form.discountType, discountValue: Number(form.discountValue), startDate: new Date(form.startDate).toISOString(), endDate: new Date(form.endDate).toISOString(), isActive: true });
      }
      onCreated();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Could not save this record.';
      if (changesStarted) { setSaveIncomplete(true); setError(`${message} Some changes may already have been saved. Close and reopen the product before trying again.`); }
      else setError(message);
    }
    finally { setSaving(false); }
  };

  const imagePicker = (label: string) => <section className="space-y-2">
    <p className="text-xs font-semibold">{label}{!product && <span className="text-red-600"> *</span>}</p>
    <div className="flex gap-2"><button type="button" onClick={() => setImageSource('upload')} className={`border px-3 py-2 text-xs ${imageSource === 'upload' ? 'border-[#b4830b] bg-amber-50 font-semibold' : 'border-neutral-200'}`}>Upload from PC</button><button type="button" onClick={() => setImageSource('url')} className={`border px-3 py-2 text-xs ${imageSource === 'url' ? 'border-[#b4830b] bg-amber-50 font-semibold' : 'border-neutral-200'}`}>Use image URL</button></div>
    {imageSource === 'upload' ? <input required={!product} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => setImageFile(event.target.files?.[0] ?? null)} className="block w-full text-xs" /> : <input required={!product} type="url" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="https://example.com/image.jpg" className="block w-full border border-neutral-300 px-3 py-2 text-xs" />}
    {imageSource === 'url' && imageUrl.trim() && <img src={imageUrl} alt={`${label} preview`} className="h-20 w-28 rounded border object-contain" />}
  </section>;

  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"><form onSubmit={save} className="max-h-[90vh] w-full max-w-xl overflow-y-auto border border-neutral-200 bg-white shadow-xl">
    <header className="flex items-center justify-between border-b border-neutral-200 px-5 py-4"><div><p className="text-[10px] font-semibold uppercase tracking-widest text-[#966800]">Administration</p><h2 className="mt-1 font-bold">{section === 'products' ? (product ? 'Edit product' : 'Add product') : section === 'cms' ? 'Add website content' : 'Add category or brand'}</h2></div><button type="button" aria-label="Close" onClick={onClose}><X size={18} /></button></header>
    <div className="space-y-4 p-5">
      {section === 'categories-brands' ? <p className="text-sm font-semibold text-neutral-700">Record type: {kind}</p> : section !== 'products' && <label className="block text-xs font-semibold">Record type<select value={kind} onChange={(event) => setKind(event.target.value as RecordKind)} className="mt-1 block w-full border border-neutral-300 bg-white px-3 py-2 text-sm"><option>Banner</option><option>Promotion</option></select></label>}
      {section === 'products' && <>
        <p className="text-xs text-neutral-600">Fields marked <span className="text-red-600">*</span> are required. Sizes are optional{!product && '; if none is selected, stock is recorded under One Size'}.</p>
        {optionsNotice && <p role="status" className="text-xs text-amber-700">{optionsNotice}</p>}
        <div className="grid gap-3 sm:grid-cols-2"><label className="block text-xs font-semibold">Category <span className="text-red-600">*</span><select required value={form.categoryId ?? ''} onChange={(event) => set('categoryId', event.target.value)} className="mt-1 block w-full border border-neutral-300 bg-white px-3 py-2 text-sm"><option value="">Select category</option>{categories.map((item) => <option key={String(item.id)} value={String(item.id)}>{String(item.name)}</option>)}</select></label><label className="block text-xs font-semibold">Brand<select value={form.brandId ?? ''} onChange={(event) => set('brandId', event.target.value)} className="mt-1 block w-full border border-neutral-300 bg-white px-3 py-2 text-sm"><option value="">Select brand</option>{brands.map((item) => <option key={String(item.id)} value={String(item.id)}>{String(item.name)}</option>)}</select></label></div>
        <div className="grid gap-3 sm:grid-cols-2">{field('name', 'Product name', 'text', true)}{field('price', 'Price (XAF)', 'number', true)}<label className="block text-xs font-semibold">Jersey season (optional)<select value={form.season ?? ''} onChange={(event) => set('season', event.target.value)} className="mt-1 block w-full border border-neutral-300 bg-white px-3 py-2 text-sm"><option value="">Not specified</option>{form.season && !seasonOptions.includes(form.season) && <option value={form.season}>{form.season}</option>}{seasonOptions.map((season) => <option key={season} value={season}>{season}</option>)}</select></label><label className="block text-xs font-semibold">Edition (optional)<select value={form.edition ?? ''} onChange={(event) => set('edition', event.target.value)} className="mt-1 block w-full border border-neutral-300 bg-white px-3 py-2 text-sm"><option value="">Not specified</option>{form.edition && !editionOptions.some((item) => item.name === form.edition) && !['Player Edition', 'Fan Edition', 'Home Edition', 'Away Edition', 'Third Edition', 'Training Edition'].includes(form.edition) && <option value={form.edition}>{form.edition}</option>}{editionOptions.map((item) => <option key={String(item.id)} value={String(item.name)}>{String(item.name)}</option>)}{['Player Edition', 'Fan Edition', 'Home Edition', 'Away Edition', 'Third Edition', 'Training Edition'].filter((name) => !editionOptions.some((item) => item.name === name)).map((name) => <option key={name} value={name}>{name}</option>)}</select></label></div>
        <label className="block text-xs font-semibold">Sizes <span className="font-normal text-neutral-500">Choose sizes, then enter the actual quantity for each size. Existing sizes are retained.</span><div className="mt-2 flex flex-wrap gap-2">{sizes.map((size) => <button key={size} type="button" aria-pressed={selectedSizes.includes(size)} disabled={existingVariants.some((variant) => String(variant.size || 'One Size') === size)} onClick={() => { setSelectedSizes((current) => current.includes(size) ? current.filter((item) => item !== size) : [...current, size]); setStockBySize((current) => ({ ...current, [size]: current[size] ?? '' })); }} className={`min-h-10 min-w-11 border px-3 text-xs font-semibold ${selectedSizes.includes(size) ? 'border-[#b4830b] bg-amber-100 text-black' : 'border-neutral-300'}`}>{size}</button>)}</div></label>
        <fieldset className="grid gap-3 sm:grid-cols-3"><legend className="mb-2 text-xs font-semibold">{product ? "Stock by variant" : "Initial stock by size"} <span className="text-red-600">*</span></legend>
          {existingVariants.map((variant) => <label key={String(variant.id)} className="text-xs font-semibold">{String(variant.size || "One Size")} {String(variant.edition || "")} ({String(variant.sku || "variant")})<input required type="number" min="0" step="1" value={variantStock[String(variant.id)] ?? ""} onChange={(event) => setVariantStock((current) => ({ ...current, [String(variant.id)]: event.target.value }))} className="mt-1 block w-full border border-neutral-300 px-3 py-2 text-sm font-normal" /></label>)}
          {(product ? selectedSizes.filter((size) => !existingVariants.some((variant) => String(variant.size || "One Size") === size)) : selectedSizes.length ? selectedSizes : ["One Size"]).map((size) => <label key={size} className="text-xs font-semibold">{size} quantity<input required type="number" min="0" step="1" value={stockBySize[size] ?? ""} onChange={(event) => setStockBySize((current) => ({ ...current, [size]: event.target.value }))} className="mt-1 block w-full border border-neutral-300 px-3 py-2 text-sm font-normal" /></label>)}
        </fieldset>
        <p className="text-xs text-neutral-600">Total stock: {Object.values(variantStock).reduce((total, value) => total + (Number(value) || 0), 0) + (product ? selectedSizes.filter((size) => !existingVariants.some((variant) => String(variant.size || "One Size") === size)) : selectedSizes.length ? selectedSizes : ["One Size"]).reduce((total, size) => total + (Number(stockBySize[size]) || 0), 0)}</p>
        <label className="block text-xs font-semibold">Description (optional)<textarea rows={2} value={form.description ?? ''} onChange={(event) => set('description', event.target.value)} className="mt-1 block w-full border border-neutral-300 px-3 py-2 text-sm font-normal"/><button type="button" disabled={!form.name?.trim()} onClick={() => set('description', generatedDescription())} className="mt-1 text-[10px] font-semibold text-[#8b6100] underline disabled:opacity-50">Generate from product details</button></label>
        {product && <label className="block text-xs font-semibold">Storefront status<select value={form.status} onChange={(event) => set("status", event.target.value)} className="mt-1 block w-full border border-neutral-300 bg-white px-3 py-2 text-sm"><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></label>}
        {product && existingImages.length > 0 && <section><p className="text-xs text-neutral-600">Existing images are retained. Select a new main image to replace the current main image.</p><div className="mt-2 flex flex-wrap gap-2">{existingImages.map((image) => { const url = String(image.imageUrl || ''); let src = url; if (url.startsWith('/uploads')) { try { src = new URL(url, new URL(process.env.NEXT_PUBLIC_API_URL ?? '').origin).href; } catch { /* Keep the relative URL. */ } } return <div key={String(image.id)} className="w-20 text-center text-[10px]"><img src={src} alt={String(image.altText || 'Product image')} className="h-20 w-20 border object-contain"/>{image.isPrimary ? 'Main' : 'Gallery'}</div>; })}</div></section>}
        {imagePicker('Main product image')}
        <details className="border-t border-neutral-100 pt-3"><summary className="cursor-pointer text-xs font-semibold">Additional product photos (optional)</summary><p className="mt-1 text-[10px] text-neutral-500">Add back, side, or detail views now, or skip this and publish faster.</p><div className="mt-3 grid gap-3 sm:grid-cols-2">{gallerySlots.map((slot, index) => <div key={index} className="space-y-2 border border-neutral-200 p-3"><p className="text-[10px] font-semibold">Photo {index + 1}</p><div className="flex gap-2"><button type="button" onClick={() => setGallerySlots((current) => current.map((item, i) => i === index ? { ...item, source: 'upload' } : item))} className={`border px-2 py-1.5 text-[10px] ${slot.source === 'upload' ? 'border-[#b4830b] bg-amber-50' : 'border-neutral-200'}`}>Upload</button><button type="button" onClick={() => setGallerySlots((current) => current.map((item, i) => i === index ? { ...item, source: 'url' } : item))} className={`border px-2 py-1.5 text-[10px] ${slot.source === 'url' ? 'border-[#b4830b] bg-amber-50' : 'border-neutral-200'}`}>Image URL</button></div>{slot.source === 'upload' ? <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => setGallerySlots((current) => current.map((item, i) => i === index ? { ...item, file: event.target.files?.[0] ?? null } : item))} className="block w-full text-[10px]" /> : <input type="url" value={slot.url} onChange={(event) => setGallerySlots((current) => current.map((item, i) => i === index ? { ...item, url: event.target.value } : item))} placeholder="https://example.com/view.jpg" className="block w-full border border-neutral-300 px-2 py-1.5 text-[10px]" />}</div>)}</div></details>
      </>}
      {section === 'categories-brands' && <>{field('name', `${kind} name`, 'text', true)}{field('description', 'Description')}{kind === 'Category' && imagePicker('Category image')}</>}
      {section === 'cms' && kind === 'Banner' && <>{field('title', 'Title', 'text', true)}{field('imageUrl', 'Image URL', 'url', true)}{field('linkUrl', 'Destination link', 'url')}</>}
      {section === 'cms' && kind === 'Promotion' && <>{field('title', 'Title', 'text', true)}{field('description', 'Description')}{field('discountValue', 'Discount value', 'number', true)}<label className="block text-xs font-semibold">Discount type<select value={form.discountType ?? 'PERCENTAGE'} onChange={(event) => set('discountType', event.target.value)} className="mt-1 block w-full border border-neutral-300 bg-white px-3 py-2 text-sm"><option value="PERCENTAGE">Percentage</option><option value="FIXED_AMOUNT">Fixed amount (XAF)</option></select></label>{field('startDate', 'Starts', 'datetime-local', true)}{field('endDate', 'Ends', 'datetime-local', true)}</>}
      {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
    </div>
    <footer className="flex justify-end gap-2 border-t border-neutral-200 px-5 py-4"><button type="button" onClick={onClose} className="border border-neutral-300 px-4 py-2 text-xs font-semibold">Cancel</button><button disabled={saving || loadingProduct || saveIncomplete} className="bg-[#D4AF37] px-4 py-2 text-xs font-bold text-black disabled:opacity-50">{saving ? 'Saving…' : 'Create record'}</button></footer>
  </form></div>;
}
