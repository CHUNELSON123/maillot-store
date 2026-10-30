'use client';

import { useEffect, useState } from 'react';
import { Check, Plus, X, Pencil, Trash2 } from 'lucide-react';
import { AdminDataTable } from './admin-data-table';
import { AdminCreateRecordDialog } from './admin-create-record-dialog';
import { useAdminSection } from '../hooks/use-admin-section';
import { AdminRecord, AdminSection } from '../types/admin.types';
import { adminService } from '../services/admin.service';

const meta: Record<Exclude<AdminSection, 'dashboard' | 'reports'>, { title: string; description: string }> = {
  products: { title: 'Product Management', description: 'Manage the shared product catalogue and its storefront visibility.' },
  'categories-brands': { title: 'Category / Brand Management', description: 'Maintain the categories and brands used by catalogue records.' },
  inventory: { title: 'Inventory Management', description: 'Review variant quantities and stock thresholds. Quantity changes use transactional inventory adjustments.' },
  orders: { title: 'Order Management', description: 'Review orders across sales channels and process supported order status changes.' },
  customers: { title: 'Customer Management', description: 'View registered customers and their order activity. Authentication secrets are excluded.' },
  influencers: { title: 'Influencer Management', description: 'Review applications and influencer accounts. Commission changes apply to future sales.' },
  payments: { title: 'Payment Management', description: 'Review recorded payments. No provider transactions are automatically verified.' },
  delivery: { title: 'Delivery Management', description: 'Update existing delivery status, provider, address, and tracking details.' },
  cms: { title: 'Website Content / CMS', description: 'Manage persisted banners and promotions displayed on the storefront.' },
  users: { title: 'Users, Roles & Permissions', description: 'Review user and role assignments. Password hashes and authentication secrets are never displayed.' },
  settings: { title: 'System Settings', description: 'Review persisted settings. Sensitive values are hidden from this view.' },
};

const choices: Partial<Record<AdminSection, string[]>> = {
  orders: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
  payments: ['PENDING', 'PAID', 'FAILED', 'CANCELLED'],
  delivery: ['PENDING', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'],
};

export function AdminSectionPage({ section }: { section: Exclude<AdminSection, 'dashboard' | 'reports'> }) {
  const data = useAdminSection(section);
  const [selected, setSelected] = useState<AdminRecord | null>(null);
  const [status, setStatus] = useState('');
  const [verified, setVerified] = useState(false);
  const [working, setWorking] = useState(false);
  const [actionError, setActionError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [variants, setVariants] = useState<AdminRecord[]>([]);
  const [images, setImages] = useState<AdminRecord[]>([]);
  const [variantForm, setVariantForm] = useState({ sku: '', size: '', color: '', edition: '', price: '' });
  const [assetLoading, setAssetLoading] = useState(false);
  const [movements, setMovements] = useState<AdminRecord[]>([]);
  const [movementType, setMovementType] = useState('STOCK_IN');
  const [movementQuantity, setMovementQuantity] = useState('');
  const [movementReference, setMovementReference] = useState('');
  const [influencerHistory, setInfluencerHistory] = useState<{ referrals: AdminRecord[]; commissions: AdminRecord[]; withdrawals: AdminRecord[] } | null>(null);
  const content = meta[section];
  const canManage = choices[section] !== undefined || ['products', 'inventory', 'influencers', 'categories-brands', 'cms'].includes(section);
  const open = (record: AdminRecord) => { setSelected(record); setStatus(String(section === 'inventory' ? record.quantity ?? 0 : section === 'products' ? record.status ?? 'ACTIVE' : section === 'influencers' ? '' : record.status ?? record.delivery_status ?? 'PENDING')); setVerified(false); setActionError(''); setForm(Object.fromEntries(Object.entries(record).map(([key, value]) => [key, value === null || value === undefined ? '' : String(value)]))); if (section === 'customers') { setAssetLoading(true); adminService.getCustomer(String(record.id)).then(setSelected).catch((cause) => setActionError(cause instanceof Error ? cause.message : 'Could not load customer details.')).finally(() => setAssetLoading(false)); } if (section === 'products') { setAssetLoading(true); setVariantForm({ sku: '', size: '', color: '', edition: '', price: '' }); Promise.all([adminService.getProductVariants(String(record.id)), adminService.getProductImages(String(record.id))]).then(([nextVariants, nextImages]) => { setVariants(nextVariants); setImages(nextImages); }).catch((cause) => setActionError(cause instanceof Error ? cause.message : 'Could not load product variants and images.')).finally(() => setAssetLoading(false)); } if (section === 'inventory') { setAssetLoading(true); adminService.getInventoryMovements(String(record.variant_id)).then(setMovements).catch((cause) => setActionError(cause instanceof Error ? cause.message : 'Could not load inventory history.')).finally(() => setAssetLoading(false)); } if (section === 'influencers') { setAssetLoading(true); setInfluencerHistory(null); Promise.all([adminService.getInfluencerReferrals(String(record.id)), adminService.getInfluencerCommissions(String(record.id)), adminService.getInfluencerWithdrawals(String(record.id))]).then(([referrals, commissions, withdrawals]) => setInfluencerHistory({ referrals, commissions, withdrawals })).catch((cause) => setActionError(cause instanceof Error ? cause.message : 'Could not load influencer history.')).finally(() => setAssetLoading(false)); } };
  const addVariant = async () => { if (!selected) return; setWorking(true); setActionError(''); try { await adminService.createProductVariant(String(selected.id), { ...variantForm, price: variantForm.price ? Number(variantForm.price) : undefined, status: 'ACTIVE' }); setVariants(await adminService.getProductVariants(String(selected.id))); setVariantForm({ sku: '', size: '', color: '', edition: '', price: '' }); } catch (cause) { setActionError(cause instanceof Error ? cause.message : 'Could not create product variant.'); } finally { setWorking(false); } };
  const uploadImage = async (file?: File) => { if (!file || !selected) return; setWorking(true); setActionError(''); try { await adminService.uploadProductImage(String(selected.id), file, String(selected.name ?? 'Product image')); setImages(await adminService.getProductImages(String(selected.id))); } catch (cause) { setActionError(cause instanceof Error ? cause.message : 'Could not upload image.'); } finally { setWorking(false); } };
  const addMovement = async () => { if (!selected) return; setWorking(true); setActionError(''); try { await adminService.createInventoryMovement({ variantId: String(selected.variant_id), quantity: Number(movementQuantity), movementType, reference: movementReference || undefined }); const [updated, nextMovements] = await Promise.all([adminService.getSection('inventory', data.page, data.search), adminService.getInventoryMovements(String(selected.variant_id))]); data.update(updated); setMovements(nextMovements); setMovementQuantity(''); setMovementReference(''); } catch (cause) { setActionError(cause instanceof Error ? cause.message : 'Could not record stock movement.'); } finally { setWorking(false); } };
  const createDelivery = async () => { if (!selected) return; setWorking(true); setActionError(''); try { await adminService.createDelivery({ orderId: String(selected.id), address: [selected.delivery_address, selected.delivery_city, selected.delivery_postal_code].filter(Boolean).join(', '), provider: form.newProvider || undefined }); setSelected(null); await data.refresh(); } catch (cause) { setActionError(cause instanceof Error ? cause.message : 'Could not create delivery record.'); } finally { setWorking(false); } };
  const save = async () => {
    if (!selected) return;
    setWorking(true); setActionError('');
    try {
      if (section === 'orders') await adminService.updateOrderStatus(String(selected.id), status);
      if (section === 'payments') {
        if (status === 'PAID' && !verified) throw new Error('Confirm that the payment was independently verified before recording it as paid.');
        await adminService.updatePaymentStatus(String(selected.id), status, form.transactionReference || undefined);
      }
      if (section === 'delivery') await adminService.updateDelivery(String(selected.id), { deliveryStatus: status, trackingNumber: form.tracking_number || undefined, provider: form.provider || undefined, address: form.address || undefined });
      if (section === 'influencers') {
        if (status === 'APPROVED') await adminService.approveInfluencer(String(selected.id));
        if (status === 'REJECTED') await adminService.updateInfluencer(String(selected.id), { status });
        if (form.commissionRate !== String(selected.commissionRate) || form.customerDiscountRate !== String(selected.customerDiscountRate)) {
          await adminService.updateInfluencer(String(selected.id), { commissionRate: Number(form.commissionRate), customerDiscountRate: Number(form.customerDiscountRate) });
        }
      }
      if (section === 'products') await adminService.updateProduct(String(selected.id), { name: form.name, price: Number(form.price), status });
      if (section === 'inventory') await adminService.updateInventory(String(selected.variant_id), { quantity: Number(status), minStock: Number(form.min_stock ?? selected.min_stock ?? 0) });
      if (section === 'categories-brands') {
        const payload = { name: form.name, description: form.description || undefined };
        if (selected._recordType === 'Category') await adminService.updateCategory(String(selected.id), payload);
        else await adminService.updateBrand(String(selected.id), payload);
      }
      if (section === 'cms') {
        if (selected._recordType === 'Banner') await adminService.updateBanner(String(selected.id), { title: form.title, imageUrl: form.imageUrl, linkUrl: form.linkUrl || undefined, isActive: form.isActive === 'true' });
        else await adminService.updatePromotion(String(selected.id), { title: form.title, description: form.description, discountType: form.discountType, discountValue: Number(form.discountValue), startDate: new Date(form.startDate).toISOString(), endDate: new Date(form.endDate).toISOString(), isActive: form.isActive === 'true' });
      }
      setSelected(null);
      await data.refresh();
      if (section === 'categories-brands') await loadCatalogueManagement();
    } catch (cause) { setActionError(cause instanceof Error ? cause.message : 'Could not save this change.'); }
    finally { setWorking(false); }
  };
  const dashboardSubtitle = section === 'payments' ? 'Only record PAID after confirming the actual receipt of funds.' : section === 'inventory' ? 'This changes quantity through the existing movement-aware inventory workflow.' : undefined;

  const [categorySearch, setCategorySearch] = useState('');
  const [brandSearch, setBrandSearch] = useState('');
  const [catalogueCategories, setCatalogueCategories] = useState<AdminRecord[]>([]);
  const [catalogueBrands, setCatalogueBrands] = useState<AdminRecord[]>([]);
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const [catalogueLoading, setCatalogueLoading] = useState(false);
  const [catalogueError, setCatalogueError] = useState('');
  const [createKind, setCreateKind] = useState<'Category' | 'Brand'>('Category');

  const loadCatalogueManagement = async () => {
    setCatalogueLoading(true);
    setCatalogueError('');

    try {
      const [categories, brands] = await Promise.all([
        adminService.getCategories(),
        adminService.getBrands(),
      ]);

      setCatalogueCategories(categories);
      setCatalogueBrands(brands);

      const records: Array<AdminRecord & { _recordType: 'Category' | 'Brand' }> = [
        ...categories.map((record): AdminRecord & { _recordType: 'Category' } => ({ ...record, _recordType: 'Category' })),
        ...brands.map((record): AdminRecord & { _recordType: 'Brand' } => ({ ...record, _recordType: 'Brand' })),
      ];

      const counts = await Promise.all(
        records.map(async (record) => {
          const id = String(record.id ?? '');
          if (!id) return [id, 0] as const;

          const result = await adminService.getProductPage({
            page: 1,
            categoryId: record._recordType === 'Category' ? id : undefined,
            brandId: record._recordType === 'Brand' ? id : undefined,
          });

          return [id, result.total] as const;
        }),
      );

      setProductCounts(Object.fromEntries(counts));
    } catch (cause) {
      setCatalogueError(
        cause instanceof Error ? cause.message : 'Could not load categories, brands, and product counts.',
      );
    } finally {
      setCatalogueLoading(false);
    }
  };

  useEffect(() => {
    if (section === 'categories-brands') {
      void loadCatalogueManagement();
    }
  }, [section]);

  const categoryItems = catalogueCategories
    .filter((item) => String(item.name ?? '').toLowerCase().includes(categorySearch.toLowerCase()))
    .map((item) => ({ ...item, _recordType: 'Category' }));

  const brandItems = catalogueBrands
    .filter((item) => String(item.name ?? '').toLowerCase().includes(brandSearch.toLowerCase()))
    .map((item) => ({ ...item, _recordType: 'Brand' }));


  const removeCatalogueRecord = async (record: AdminRecord) => {
    const kind = String(record._recordType ?? '');
    if (kind !== 'Category' && kind !== 'Brand') return;

    const name = String(record.name ?? kind);
    if (!window.confirm(`Delete ${kind.toLowerCase()} "${name}"?`)) return;

    setWorking(true);
    setActionError('');
    setCatalogueError('');

    try {
      if (kind === 'Category') {
        await adminService.deleteCategory(String(record.id));
      } else {
        await adminService.deleteBrand(String(record.id));
      }

      await loadCatalogueManagement();
      await data.refresh(1, '');
    } catch (cause) {
      setCatalogueError(
        cause instanceof Error ? cause.message : `Could not delete this ${kind.toLowerCase()}.`,
      );
    } finally {
      setWorking(false);
    }
  };
  const openCreate = (kind: 'Category' | 'Brand') => {
    setCreateKind(kind);
    setCreateOpen(true);
  };

  return <div className="mx-auto max-w-[1500px] space-y-6">
    <div>
      <p className="text-xs text-neutral-500">Administration / {content.title}</p>
      <h1 className="mt-1 text-2xl font-black">{content.title}</h1>
      <p className="mt-1 max-w-3xl text-sm text-neutral-600">{content.description}</p>
    </div>

    {section === 'categories-brands' ? (
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
        {([
          { title: 'Categories', kind: 'Category' as const, items: categoryItems, search: categorySearch, setSearch: setCategorySearch, description: 'Organize products into clear shopping categories.' },
          { title: 'Brands', kind: 'Brand' as const, items: brandItems, search: brandSearch, setSearch: setBrandSearch, description: 'Manage the brands available in your catalogue.' },
        ]).map((group) => (
          <section key={group.kind} className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-neutral-100 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-neutral-900">{group.title}</h2>
                <p className="mt-1 text-sm text-neutral-500">{group.description}</p>
              </div>
              <button onClick={() => openCreate(group.kind)} className="inline-flex h-10 items-center justify-center gap-2 self-start rounded bg-[#D4AF37] px-4 text-xs font-bold text-black hover:bg-[#c5a02f]">
                <Plus size={15} /> Add {group.kind}
              </button>
            </div>

            <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <input
                value={group.search}
                onChange={(event) => group.setSearch(event.target.value)}
                placeholder={`Search ${group.title.toLowerCase()}...`}
                className="h-10 w-full rounded border border-neutral-200 px-3 text-sm outline-none focus:border-[#D4AF37] sm:max-w-sm"
              />
              <span className="text-xs text-neutral-500">{group.items.length} {group.title.toLowerCase()}</span>
            </div>

            {data.error ? (
              <p className="p-5 text-sm text-red-700">{data.error}</p>
            ) : data.loading ? (
              <p className="p-8 text-center text-sm text-neutral-500">Loading {group.title.toLowerCase()}...</p>
            ) : group.items.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-sm font-semibold text-neutral-700">No {group.title.toLowerCase()} found</p>
                <p className="mt-1 text-xs text-neutral-500">Add a {group.kind.toLowerCase()} to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-left text-sm">
                  <thead className="bg-neutral-50 text-[10px] uppercase tracking-wide text-neutral-500">
                    <tr>
                      <th className="px-5 py-3 font-semibold">{group.kind} name</th>
                      <th className="px-5 py-3 font-semibold">Products</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                      <th className="px-5 py-3 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {group.items.map((record: AdminRecord) => (
                      <tr key={String(record.id)} className="hover:bg-neutral-50">
                        <td className="px-5 py-4 font-semibold text-neutral-900">{String(record.name ?? '—')}</td>
                        <td className="px-5 py-4 text-neutral-600">{catalogueLoading ? '…' : (productCounts[String(record.id)] ?? 0)}</td>
                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            {String(record.status ?? (record.isActive === false ? 'INACTIVE' : 'ACTIVE'))}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="inline-flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => open({ ...record, _recordType: group.kind })}
                              title="Edit"
                              aria-label={`Edit ${group.kind.toLowerCase()} ${String(record.name ?? '')}`}
                              className="rounded border border-neutral-200 p-2 text-neutral-600 hover:border-[#D4AF37] hover:text-black"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => void removeCatalogueRecord({ ...record, _recordType: group.kind })}
                              title="Delete"
                              aria-label={`Delete ${group.kind.toLowerCase()} ${String(record.name ?? '')}`}
                              disabled={working}
                              className="rounded border border-neutral-200 p-2 text-red-600 hover:border-red-300 disabled:opacity-50"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ))}
      </div>
    ) : (
      <>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>{dashboardSubtitle && <div className="border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">{dashboardSubtitle}</div>}</div>
          {['products', 'cms'].includes(section) && <button onClick={() => setCreateOpen(true)} className="inline-flex h-10 items-center justify-center gap-2 bg-[#D4AF37] px-4 text-xs font-bold text-black"><Plus size={15}/>{section === 'products' ? 'Add Product' : 'Add Content'}</button>}
        </div>
        <AdminDataTable section={section} items={data.items} total={data.total} page={data.page} limit={data.limit} search={data.search} setSearch={data.setSearch} onPage={(page) => void data.refresh(page)} loading={data.loading} error={data.error} onSelect={canManage || section === 'customers' ? open : undefined} actionLabel={canManage ? 'Manage' : 'View'} status={data.status} onStatusChange={(status) => { data.setStatus(status); void data.refresh(1, data.search, status); }}/>
      </>
    )}

    {createOpen && <AdminCreateRecordDialog section={section} initialKind={section === 'categories-brands' ? createKind : undefined} onClose={() => setCreateOpen(false)} onCreated={() => { setCreateOpen(false); void data.refresh(1, ''); if (section === 'categories-brands') void loadCatalogueManagement(); }} />}
    {selected && <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"><section className="w-full max-w-lg border border-neutral-200 bg-white shadow-xl"><header className="flex items-center justify-between border-b border-neutral-200 px-5 py-4"><div><h2 className="font-bold">{section === 'customers' ? 'Customer details' : `Manage ${content.title.replace(' Management', '')}`}</h2><p className="mt-1 text-xs text-neutral-500">{String(selected.order_number ?? selected.name ?? selected.referralCode ?? selected.id ?? '')}</p></div><button aria-label="Close" onClick={() => setSelected(null)}><X size={18}/></button></header><div className="space-y-4 p-5">
      {choices[section] ? <label className="block text-xs font-semibold">Status<select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-1 block w-full border border-neutral-300 bg-white px-3 py-2 text-sm">{choices[section]?.map((option) => <option key={option}>{option}</option>)}</select></label> : section === 'products' ? <><label className="block text-xs font-semibold">Product name<input value={form.name ?? ''} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="mt-1 block w-full border border-neutral-300 px-3 py-2 text-sm"/></label><label className="block text-xs font-semibold">Price (XAF)<input type="number" min="0" value={form.price ?? ''} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} className="mt-1 block w-full border border-neutral-300 px-3 py-2 text-sm"/></label><label className="block text-xs font-semibold">Storefront status<select value={status || String(selected.status ?? 'ACTIVE')} onChange={(event) => setStatus(event.target.value)} className="mt-1 block w-full border border-neutral-300 bg-white px-3 py-2 text-sm"><option>ACTIVE</option><option>INACTIVE</option></select></label><section className="border-t border-neutral-200 pt-4"><h3 className="font-semibold">Variants and stock</h3>{assetLoading ? <p className="mt-2 text-xs text-neutral-500">Loading variantsâ€¦</p> : variants.length ? <ul className="mt-2 space-y-1 text-xs text-neutral-600">{variants.map((variant) => <li key={String(variant.id)} className="border border-neutral-100 p-2">{String(variant.sku)} Â· {[variant.size, variant.color, variant.edition].filter(Boolean).join(' / ') || 'Standard'} Â· {String(variant.status)}</li>)}</ul> : <p className="mt-2 text-xs text-neutral-500">No variants yet.</p>}<div className="mt-3 grid gap-2 sm:grid-cols-2">{(['sku', 'size', 'color', 'edition', 'price'] as const).map((key) => <input key={key} required={key === 'sku'} type={key === 'price' ? 'number' : 'text'} min={key === 'price' ? '0' : undefined} placeholder={key === 'sku' ? 'SKU' : key[0].toUpperCase() + key.slice(1)} value={variantForm[key]} onChange={(event) => setVariantForm((current) => ({ ...current, [key]: event.target.value }))} className="border border-neutral-300 px-3 py-2 text-xs"/>)}</div><button type="button" disabled={working || !variantForm.sku.trim()} onClick={() => void addVariant()} className="mt-2 border border-neutral-300 px-3 py-2 text-xs font-semibold disabled:opacity-50">Add variant (starts at 0 stock)</button></section><section className="border-t border-neutral-200 pt-4"><h3 className="font-semibold">Product images</h3><ul className="mt-2 space-y-1 text-xs text-neutral-600">{images.map((image) => <li key={String(image.id)} className="truncate">{String(image.imageUrl ?? '')}</li>)}</ul><label className="mt-3 block text-xs font-semibold">Upload image<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => void uploadImage(event.target.files?.[0])} className="mt-1 block w-full text-xs"/></label><small className="mt-1 block text-[10px] text-neutral-500">Images are saved by the configured server upload endpoint.</small></section></> : section === 'inventory' ? <><label className="block text-xs font-semibold">New quantity<input type="number" min="0" value={status} onChange={(event) => setStatus(event.target.value)} className="mt-1 block w-full border border-neutral-300 px-3 py-2 text-sm"/></label><label className="block text-xs font-semibold">Low-stock threshold<input type="number" min="0" value={form.min_stock ?? '0'} onChange={(event) => setForm((current) => ({ ...current, min_stock: event.target.value }))} className="mt-1 block w-full border border-neutral-300 px-3 py-2 text-sm"/></label><section className="border-t border-neutral-200 pt-4"><h3 className="font-semibold">Stock movements</h3>{assetLoading ? <p className="mt-2 text-xs text-neutral-500">Loading movement historyâ€¦</p> : <ul className="mt-2 max-h-32 space-y-1 overflow-auto text-xs text-neutral-600">{movements.slice(0, 10).map((movement) => <li key={String(movement.id)} className="border border-neutral-100 p-2">{String(movement.movementType)} Â· {String(movement.quantity)} Â· {String(movement.reference ?? '')}</li>)}</ul>}<div className="mt-3 grid gap-2 sm:grid-cols-2"><select value={movementType} onChange={(event) => setMovementType(event.target.value)} className="border border-neutral-300 bg-white px-3 py-2 text-xs"><option>STOCK_IN</option><option>STOCK_OUT</option><option>DAMAGE</option><option>LOST</option><option>ADJUSTMENT</option></select><input type="number" min="0" value={movementQuantity} onChange={(event) => setMovementQuantity(event.target.value)} placeholder={movementType === 'ADJUSTMENT' ? 'Set quantity to' : 'Movement quantity'} className="border border-neutral-300 px-3 py-2 text-xs"/></div><input value={movementReference} onChange={(event) => setMovementReference(event.target.value)} placeholder="Reason / reference" className="mt-2 block w-full border border-neutral-300 px-3 py-2 text-xs"/><button type="button" disabled={working || movementQuantity === ''} onClick={() => void addMovement()} className="mt-2 border border-neutral-300 px-3 py-2 text-xs font-semibold disabled:opacity-50">Record movement</button></section></> : section === 'influencers' ? <><label className="block text-xs font-semibold">Application decision<select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-1 block w-full border border-neutral-300 bg-white px-3 py-2 text-sm"><option value="">No decision change</option><option value="APPROVED">Approve influencer</option><option value="REJECTED">Reject application</option></select></label><label className="block text-xs font-semibold">Commission rate (%)<input type="number" min="0" max="100" value={form.commissionRate ?? '0'} onChange={(event) => setForm((current) => ({ ...current, commissionRate: event.target.value }))} className="mt-1 block w-full border border-neutral-300 px-3 py-2 text-sm"/></label><label className="block text-xs font-semibold">Customer discount rate (%)<input type="number" min="0" max="100" value={form.customerDiscountRate ?? '0'} onChange={(event) => setForm((current) => ({ ...current, customerDiscountRate: event.target.value }))} className="mt-1 block w-full border border-neutral-300 px-3 py-2 text-sm"/></label></> : section === 'delivery' ? <><label className="block text-xs font-semibold">Tracking number<input value={form.tracking_number ?? ''} onChange={(event) => setForm((current) => ({ ...current, tracking_number: event.target.value }))} className="mt-1 block w-full border border-neutral-300 px-3 py-2 text-sm"/></label><label className="block text-xs font-semibold">Delivery provider<input value={form.provider ?? ''} onChange={(event) => setForm((current) => ({ ...current, provider: event.target.value }))} className="mt-1 block w-full border border-neutral-300 px-3 py-2 text-sm"/></label></> : section === 'payments' ? <label className="block text-xs font-semibold">Transaction reference<input value={form.transaction_reference ?? ''} onChange={(event) => setForm((current) => ({ ...current, transaction_reference: event.target.value }))} className="mt-1 block w-full border border-neutral-300 px-3 py-2 text-sm"/></label> : section === 'categories-brands' ? <><label className="block text-xs font-semibold">Name<input value={form.name ?? ''} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="mt-1 block w-full border border-neutral-300 px-3 py-2 text-sm"/></label><label className="block text-xs font-semibold">Description<input value={form.description ?? ''} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="mt-1 block w-full border border-neutral-300 px-3 py-2 text-sm"/></label></> : section === 'cms' ? <><label className="block text-xs font-semibold">Title<input value={form.title ?? ''} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className="mt-1 block w-full border border-neutral-300 px-3 py-2 text-sm"/></label>{selected._recordType === 'Banner' ? <><label className="block text-xs font-semibold">Image URL<input value={form.imageUrl ?? ''} onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))} className="mt-1 block w-full border border-neutral-300 px-3 py-2 text-sm"/></label><label className="block text-xs font-semibold">Link URL<input value={form.linkUrl ?? ''} onChange={(event) => setForm((current) => ({ ...current, linkUrl: event.target.value }))} className="mt-1 block w-full border border-neutral-300 px-3 py-2 text-sm"/></label></> : <><label className="block text-xs font-semibold">Description<input value={form.description ?? ''} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="mt-1 block w-full border border-neutral-300 px-3 py-2 text-sm"/></label><label className="block text-xs font-semibold">Discount value<input type="number" min="0" value={form.discountValue ?? ''} onChange={(event) => setForm((current) => ({ ...current, discountValue: event.target.value }))} className="mt-1 block w-full border border-neutral-300 px-3 py-2 text-sm"/></label></>}<label className="block text-xs font-semibold">Active<select value={form.isActive ?? 'false'} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.value }))} className="mt-1 block w-full border border-neutral-300 bg-white px-3 py-2 text-sm"><option value="true">Active</option><option value="false">Inactive</option></select></label></> : null}
      {section === 'payments' && status === 'PAID' && <label className="flex items-start gap-2 text-xs text-neutral-700"><input type="checkbox" checked={verified} onChange={(event) => setVerified(event.target.checked)}/><span>I verified receipt of this payment through the businessâ€™s actual payment process.</span></label>}
      {section === 'orders' && !selected.delivery && selected.delivery_method === 'DELIVERY' && <section className="border-t border-neutral-200 pt-4"><h3 className="font-semibold">Create delivery record</h3><p className="mt-1 text-xs text-neutral-500">Uses the delivery address saved on this order.</p><input value={form.newProvider ?? ''} onChange={(event) => setForm((current) => ({ ...current, newProvider: event.target.value }))} placeholder="Delivery provider (optional)" className="mt-3 block w-full border border-neutral-300 px-3 py-2 text-xs"/><button type="button" disabled={working} onClick={() => void createDelivery()} className="mt-2 border border-neutral-300 px-3 py-2 text-xs font-semibold disabled:opacity-50">Create delivery</button></section>}
      {actionError && <p className="text-xs text-red-700">{actionError}</p>}
      {section === 'customers' && assetLoading ? <p className="text-xs text-neutral-500">Loading customer details and order historyâ€¦</p> : section === 'customers' || section === 'users' || section === 'settings' || section === 'orders' || section === 'payments' || section === 'delivery' ? <pre className="max-h-64 overflow-auto bg-neutral-50 p-3 text-[10px] leading-5 text-neutral-600">{JSON.stringify(selected, null, 2)}</pre> : null}
      {section === 'influencers' && (assetLoading ? <p className="text-xs text-neutral-500">Loading referrals, commissions, and withdrawalsâ€¦</p> : influencerHistory ? <div className="space-y-2"><details><summary className="cursor-pointer text-xs font-semibold">Referrals ({influencerHistory.referrals.length})</summary><pre className="mt-1 max-h-32 overflow-auto bg-neutral-50 p-2 text-[10px]">{JSON.stringify(influencerHistory.referrals, null, 2)}</pre></details><details><summary className="cursor-pointer text-xs font-semibold">Commissions ({influencerHistory.commissions.length})</summary><pre className="mt-1 max-h-32 overflow-auto bg-neutral-50 p-2 text-[10px]">{JSON.stringify(influencerHistory.commissions, null, 2)}</pre></details><details><summary className="cursor-pointer text-xs font-semibold">Withdrawals ({influencerHistory.withdrawals.length})</summary><pre className="mt-1 max-h-32 overflow-auto bg-neutral-50 p-2 text-[10px]">{JSON.stringify(influencerHistory.withdrawals, null, 2)}</pre></details></div> : null)}
    </div><footer className="flex justify-end gap-2 border-t border-neutral-200 px-5 py-4"><button onClick={() => setSelected(null)} className="border border-neutral-300 px-4 py-2 text-xs font-semibold">Close</button>{canManage && <button onClick={() => void save()} disabled={working} className="inline-flex items-center gap-2 bg-[#D4AF37] px-4 py-2 text-xs font-bold text-black disabled:opacity-50"><Check size={14}/>{working ? 'Savingâ€¦' : 'Save changes'}</button>}</footer></section></div>}
  </div>;
}
