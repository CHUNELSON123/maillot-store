'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { catalogueService } from '@/modules/catalogue/services/catalogue.service';
import { cmsService } from '@/modules/cms/services/cms.service';
import { Product, ProductImage } from '@/modules/catalogue/types/catalogue.types';
import { Promotion } from '@/modules/cms/types/cms.types';
import { useInfluencerPortal } from './influencer-portal-context';

const apiOrigin = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/v1').replace(/\/v1\/?$/, '');

export function InfluencerProductsPage() {
  const { data } = useInfluencerPortal();
  const [tab, setTab] = useState<'products' | 'campaigns'>('products');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [images, setImages] = useState<Record<string, string>>({});
  const [totalPages, setTotalPages] = useState(0);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  const loadProducts = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await catalogueService.getProductsPage({ page, limit: 8, search: search.trim() || undefined });
      const imageRows = await Promise.all(response.items.map(product => catalogueService.getProductImages(product.id).catch(() => [] as ProductImage[])));
      setProducts(response.items); setTotalPages(response.totalPages);
      const next: Record<string,string> = {};
      imageRows.forEach((rows, index) => { const image = rows.find(row => row.isPrimary) ?? rows[0]; if (image) next[response.items[index].id] = image.imageUrl; });
      setImages(next);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to load catalogue.'); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { const timer = window.setTimeout(() => void loadProducts(), search ? 250 : 0); return () => window.clearTimeout(timer); }, [loadProducts, search]);
  useEffect(() => { void cmsService.getPromotions().then(setPromotions).catch(() => setPromotions([])); }, []);

  const referralCode = data?.profile.referralCode ?? '';
  const productLink = (productId: string) => `${window.location.origin}/shop/${productId}?ref=${encodeURIComponent(referralCode)}`;
  const copyLink = async (key: string, href: string) => { try { await navigator.clipboard.writeText(href); setCopied(key); window.setTimeout(() => setCopied(''), 1800); } catch { setCopied(''); } };
  const commission = data?.profile.commissionRate ?? 0;

  return <div className="mx-auto max-w-[1250px]"><div className="mb-5"><h1 className="text-2xl font-black">Products &amp; Campaigns</h1><p className="mt-1 text-xs text-neutral-600">Choose products or active store promotions to share with your audience.</p></div>
    <div className="flex gap-5 border-b border-neutral-200"><button onClick={() => setTab('products')} className={`border-b-2 px-1 pb-3 text-xs font-bold ${tab === 'products' ? 'border-[#D4AF37] text-black' : 'border-transparent text-neutral-500'}`}>All Products</button><button onClick={() => setTab('campaigns')} className={`border-b-2 px-1 pb-3 text-xs font-bold ${tab === 'campaigns' ? 'border-[#D4AF37] text-black' : 'border-transparent text-neutral-500'}`}>Active Campaigns</button></div>
    {tab === 'products' ? <><div className="mt-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><label className="text-xs text-neutral-600">Search products<input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search catalogue…" className="ml-2 h-9 w-[min(340px,65vw)] border border-neutral-300 px-3 text-xs outline-none focus:border-[#D4AF37]" /></label><span className="text-[10px] text-neutral-500">Configured commission rate: <strong className="text-neutral-800">{commission > 0 ? `${commission}%` : 'Not configured'}</strong></span></div>
      {loading ? <p className="py-12 text-center text-xs text-neutral-500">Loading products…</p> : error ? <div role="alert" className="mt-4 border border-red-200 bg-red-50 p-4 text-xs text-red-700">{error}<button onClick={() => void loadProducts()} className="ml-2 underline">Retry</button></div> : products.length === 0 ? <p className="py-12 text-center text-xs text-neutral-500">No catalogue products match this search.</p> : <div className="mt-4 divide-y divide-neutral-200 border border-neutral-200 bg-white">{products.map(product => {
        const imageUrl = images[product.id] ? (/^https?:\/\//.test(images[product.id]) ? images[product.id] : `${apiOrigin}${images[product.id]}`) : '';
        return <article key={product.id} className="grid items-center gap-4 p-4 sm:grid-cols-[72px_1fr_auto]">{imageUrl ? <img src={imageUrl} alt={product.name} className="h-[72px] w-[72px] object-contain"/> : <div className="flex h-[72px] w-[72px] items-center justify-center bg-neutral-100 text-[9px] text-neutral-400">No image</div>}<div><h2 className="text-xs font-bold">{product.name}</h2><p className="mt-1 text-[10px] text-neutral-500">{product.description || 'Maillot Store catalogue product'}</p><p className="mt-1 text-[10px] text-neutral-700">{Number(product.price).toLocaleString()} XAF · {commission > 0 ? `Commission rate ${commission}%` : 'Commission rate is awaiting store configuration'}</p></div><div className="flex gap-2 sm:flex-col"><button onClick={() => void copyLink(product.id, productLink(product.id))} className="h-8 bg-[#D4AF37] px-4 text-[9px] font-extrabold text-black">{copied === product.id ? 'COPIED' : 'PROMOTE'}</button><Link href={`/shop/${product.id}?ref=${encodeURIComponent(referralCode)}`} className="text-center text-[9px] text-blue-700">View Details</Link></div></article>;
      })}</div>}
      <div className="mt-4 flex items-center justify-center gap-3"><button disabled={page <= 1 || loading} onClick={() => setPage(p => Math.max(1,p-1))} className="h-8 border px-3 text-xs disabled:opacity-40">‹</button><span className="text-xs">Page {page}{totalPages ? ` of ${totalPages}` : ''}</span><button disabled={page >= totalPages || loading} onClick={() => setPage(p => p+1)} className="h-8 border px-3 text-xs disabled:opacity-40">›</button></div>
    </> : <section className="mt-4 space-y-3">{promotions.length ? promotions.map(promo => <article key={promo.id} className="grid gap-4 border border-neutral-200 bg-white p-4 sm:grid-cols-[1fr_auto] sm:items-center"><div><h2 className="text-sm font-bold">{promo.title}</h2><p className="mt-1 text-xs text-neutral-600">{promo.description || 'Active store promotion'}</p><p className="mt-2 text-[10px] text-neutral-500">{promo.discountType}: {promo.discountValue} · {new Date(promo.startDate).toLocaleDateString()} – {new Date(promo.endDate).toLocaleDateString()}</p><p className="mt-1 text-[10px] text-neutral-500">Your configured commission rate: {commission > 0 ? `${commission}%` : 'Not configured'}</p></div><button onClick={() => void copyLink(promo.id, `${window.location.origin}/promotions?ref=${encodeURIComponent(referralCode)}`)} className="h-9 bg-[#D4AF37] px-5 text-[10px] font-extrabold">{copied === promo.id ? 'COPIED' : 'COPY REFERRAL LINK'}</button></article>) : <div className="border border-neutral-200 bg-white p-8 text-center text-xs text-neutral-500">There are no active promotions right now.</div>}</section>}
  </div>;
}
