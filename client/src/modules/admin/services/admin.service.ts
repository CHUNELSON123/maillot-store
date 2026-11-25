import { apiClient } from '@/services/api/api-client';
import { authStorage } from '@/lib/auth/auth-storage';
import { API_CONFIG } from '@/services/api/api-config';
import { AdminDashboardSummary, AdminPage, AdminRecord, AdminSection } from '../types/admin.types';

const token = () => authStorage.getToken() ?? undefined;
const page = (path: string, pageNumber: number, search = '', status?: string, roleId?: string) => {
  const savedLimit = typeof window === 'undefined' ? 20 : Number(window.localStorage.getItem('maillot-admin-items-per-page'));
  const limit = Number.isSafeInteger(savedLimit) && savedLimit >= 1 && savedLimit <= 100 ? savedLimit : 20;
  const query = new URLSearchParams({ page: String(pageNumber), limit: String(limit) });
  if (search.trim()) query.set('search', search.trim());
  if (status) query.set('status', status);
  if (roleId) query.set('roleId', roleId);
  return apiClient<AdminPage>(`${path}?${query}`, { token: token() });
};

export const adminService = {
  getCategories() { return apiClient<AdminRecord[]>('/categories'); },
  getBrands() { return apiClient<AdminRecord[]>('/brands', { token: token() }); },
  getProductVariants(productId: string) { return apiClient<AdminRecord[]>(`/products/${productId}/variants`); },
  getProductImages(productId: string) { return apiClient<AdminRecord[]>(`/products/${productId}/images`); },
  getProductPage(filters: { page: number; limit?: number; search?: string; categoryId?: string; brandId?: string; status?: string }) {
    const query = new URLSearchParams({ page: String(filters.page), limit: String(filters.limit ?? 5) });
    for (const key of ['search', 'categoryId', 'brandId', 'status'] as const) {
      const value = filters[key];
      if (value?.trim()) query.set(key, value.trim());
    }
    return apiClient<AdminPage<AdminRecord>>(`/products/admin?${query}`, { token: token() });
  },
  createProductVariant(productId: string, data: AdminRecord) { return apiClient<AdminRecord>(`/products/${productId}/variants`, { method: 'POST', token: token(), body: JSON.stringify(data) }); },
  createInventory(data: AdminRecord) { return apiClient('/inventory', { method: 'POST', token: token(), body: JSON.stringify(data) }); },
  getInventory(variantId: string) { return apiClient<AdminRecord>(`/inventory/${variantId}`, { token: token() }); },
  getInventorySummary() { return apiClient<{ totalItems: number; totalQuantity: number; lowStockItems: number; outOfStockItems: number }>('/inventory/summary', { token: token() }); },
  getInventoryPage(filters: { page: number; limit?: number; search?: string; categoryId?: string; brandId?: string; status?: string }) {
    const query = new URLSearchParams({ page: String(filters.page), limit: String(filters.limit ?? 20) });
    for (const key of ['search', 'categoryId', 'brandId', 'status'] as const) {
      const value = filters[key];
      if (value?.trim()) query.set(key, value.trim());
    }
    return apiClient<AdminPage<AdminRecord>>(`/admin/inventory?${query}`, { token: token() });
  },
  getInventoryMovementPage(filters: { page: number; limit?: number; search?: string; movementType?: string }) {
    const query = new URLSearchParams({ page: String(filters.page), limit: String(filters.limit ?? 20) });
    if (filters.search?.trim()) query.set('search', filters.search.trim());
    if (filters.movementType) query.set('movementType', filters.movementType);
    return apiClient<AdminPage<AdminRecord>>(`/inventory/movements/all?${query}`, { token: token() });
  },
  getOrdersPage(filters: { page: number; limit?: number; search?: string; status?: string; paymentStatus?: string; source?: string; startDate?: string; endDate?: string }) {
    const query = new URLSearchParams({ page: String(filters.page), limit: String(filters.limit ?? 5) });
    for (const key of ['search', 'status', 'paymentStatus', 'source', 'startDate', 'endDate'] as const) {
      const value = filters[key];
      if (value?.trim()) query.set(key, value.trim());
    }
    return apiClient<AdminPage<AdminRecord>>(`/admin/orders?${query}`, { token: token() });
  },
  getPaymentsPage(filters: { page: number; limit?: number; search?: string; status?: string; paymentMethod?: string; startDate?: string; endDate?: string }) {
    const query = new URLSearchParams({ page: String(filters.page), limit: String(filters.limit ?? 5) });
    for (const key of ['search', 'status', 'paymentMethod', 'startDate', 'endDate'] as const) {
      const value = filters[key];
      if (value?.trim()) query.set(key, value.trim());
    }
    return apiClient<AdminPage<AdminRecord> & { summary: { totalPayments: number; totalAmount: number; successfulPayments: number; pendingPayments: number; failedPayments: number; changes: Record<string, number | null> } }>(`/admin/payments?${query}`, { token: token() });
  },
  getDeliveriesPage(filters: { page: number; limit?: number; search?: string; status?: string; provider?: string; startDate?: string; endDate?: string }) {
    const query = new URLSearchParams({ page: String(filters.page), limit: String(filters.limit ?? 5) });
    for (const key of ['search', 'status', 'provider', 'startDate', 'endDate'] as const) {
      const value = filters[key];
      if (value?.trim()) query.set(key, value.trim());
    }
    return apiClient<AdminPage<AdminRecord> & { summary: { totalDeliveries: number; inTransit: number; delivered: number; pending: number; failed: number; changes: Record<string, number | null> }; partners: string[] }>(`/admin/deliveries?${query}`, { token: token() });
  },
  createWalkInOrder(data: { items: Array<{ variantId: string; quantity: number }>; paymentMethod: 'mtn' | 'orange' | 'card' | 'cash'; guestName: string; guestEmail?: string; guestPhone: string; deliveryMethod: 'DELIVERY' | 'PICKUP'; deliveryAddress?: string; deliveryCity?: string }) {
    return apiClient<Record<string, unknown>>('/orders/walk-in', { method: 'POST', token: token(), body: JSON.stringify({ ...data, source: 'WALK_IN' }) });
  },
  async uploadProductImage(productId: string, file: File | undefined, altText: string, isPrimary = false, externalUrl?: string) {
    const headers = new Headers();
    const accessToken = token();
    if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
    let body: BodyInit;
    if (file) {
      const formData = new FormData(); formData.append('image', file); formData.append('altText', altText); formData.append('isPrimary', String(isPrimary)); body = formData;
    } else {
      if (!externalUrl) throw new Error('Choose an image file or enter an image URL.');
      headers.set('Content-Type', 'application/json');
      body = JSON.stringify({ imageUrl: externalUrl, altText, isPrimary: String(isPrimary) });
    }
    const response = await fetch(`${API_CONFIG.baseUrl}/products/${productId}/images`, { method: 'POST', headers, body });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(typeof result.message === 'string' ? result.message : 'Could not upload the image.');
    return result as AdminRecord;
  },
  async uploadCmsImage(file: File) {
    const headers = new Headers();
    const accessToken = token();
    if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
    const body = new FormData(); body.append('image', file);
    const response = await fetch(`${API_CONFIG.baseUrl}/cms/uploads`, { method: 'POST', headers, body });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(typeof result.message === 'string' ? result.message : 'Could not upload the image.');
    return result as { imageUrl: string };
  },
  getRoles() { return apiClient<AdminRecord[]>('/admin/roles', { token: token() }); },
  getPermissions() { return apiClient<AdminRecord[]>('/admin/permissions', { token: token() }); },
  getCustomer(id: string) { return apiClient<AdminRecord>(`/admin/customers/${id}`, { token: token() }); },
  getCustomersPage(filters: { page: number; limit?: number; search?: string; status?: string; registrationSource?: string }) {
    const query = new URLSearchParams({ page: String(filters.page), limit: String(filters.limit ?? 5) });
    for (const key of ['search', 'status', 'registrationSource'] as const) {
      const value = filters[key];
      if (value?.trim()) query.set(key, value.trim());
    }
    return apiClient<AdminPage<AdminRecord>>(`/admin/customers?${query}`, { token: token() });
  },
  updateCustomer(id: string, data: { firstName: string; lastName: string; phone?: string; email: string }) {
    return apiClient<AdminRecord>(`/admin/customers/${id}`, { method: 'PATCH', token: token(), body: JSON.stringify(data) });
  },
  updateCustomerStatus(id: string, active: boolean) {
    return apiClient<AdminRecord>(`/admin/customers/${id}/status`, { method: 'PATCH', token: token(), body: JSON.stringify({ active }) });
  },
  getInfluencerReferrals(id: string) { return apiClient<AdminRecord[]>(`/influencers/${id}/referrals`, { token: token() }); },
  getInfluencerCommissions(id: string) { return apiClient<AdminRecord[]>(`/commissions/influencer/${id}`, { token: token() }); },
  getInfluencerWithdrawals(id: string) { return apiClient<AdminRecord[]>(`/withdrawals/influencer/${id}`, { token: token() }); },
  updateCommissionStatus(id: string, status: 'APPROVED') { return apiClient(`/commissions/${id}/status`, { method: 'PATCH', token: token(), body: JSON.stringify({ status }) }); },
  updateWithdrawalStatus(id: string, status: 'APPROVED' | 'REJECTED' | 'PAID', paymentReference?: string) { return apiClient(`/withdrawals/${id}/status`, { method: 'PATCH', token: token(), body: JSON.stringify({ status, paymentReference }) }); },
  async getSection(section: AdminSection, pageNumber = 1, search = '', status?: string, roleId?: string): Promise<AdminPage> {
    switch (section) {
      case 'products': return page('/products', pageNumber, search);
      case 'categories-brands': {
        const [categories, brands] = await Promise.all([
          apiClient<AdminRecord[]>('/categories', { token: token() }), apiClient<AdminRecord[]>('/brands', { token: token() }),
        ]);
        const records: AdminRecord[] = [...categories.map((record) => ({ ...record, _recordType: 'Category' })), ...brands.map((record) => ({ ...record, _recordType: 'Brand' }))];
        const matches = search ? records.filter((record) => String(record.name ?? '').toLowerCase().includes(search.toLowerCase())) : records;
        return { items: matches.slice((pageNumber - 1) * 20, pageNumber * 20), total: matches.length, page: pageNumber, limit: 20 };
      }
      case 'inventory': return page('/admin/inventory', pageNumber, search);
      case 'orders': return page('/admin/orders', pageNumber, search, status);
      case 'customers': return this.getCustomersPage({ page: pageNumber, search, status });
      case 'influencers': {
        const records = await apiClient<AdminRecord[]>('/influencers', { token: token() });
        const matches = search ? records.filter((record) => JSON.stringify(record).toLowerCase().includes(search.toLowerCase())) : records;
        return { items: matches.slice((pageNumber - 1) * 20, pageNumber * 20), total: matches.length, page: pageNumber, limit: 20 };
      }
      case 'payments': return page('/admin/payments', pageNumber, search, status);
      case 'delivery': return page('/admin/deliveries', pageNumber, search, status);
      case 'cms': {
        const [banners, promotions] = await Promise.all([
          apiClient<AdminRecord[]>('/cms/banners?activeOnly=false', { token: token() }),
          apiClient<AdminRecord[]>('/cms/promotions?activeOnly=false', { token: token() }),
        ]);
        const records = [...banners.map((record) => ({ ...record, _recordType: 'Banner' })), ...promotions.map((record) => ({ ...record, _recordType: 'Promotion' }))];
        return { items: records, total: records.length, page: 1, limit: records.length || 20 };
      }
      case 'users': return page('/admin/users', pageNumber, search, status, roleId);
      case 'settings': {
        const items = await apiClient<AdminRecord[]>('/admin/settings', { token: token() });
        return { items, total: items.length, page: 1, limit: items.length || 20 };
      }
      default: return { items: [], total: 0, page: pageNumber, limit: 20 };
    }
  },
  getDashboard(startDate?: string, endDate?: string) {
    const query = new URLSearchParams();
    if (startDate) query.set('startDate', startDate);
    if (endDate) query.set('endDate', endDate);
    return apiClient<AdminDashboardSummary>(`/reports/dashboard${query.size ? `?${query}` : ''}`, { token: token() });
  },
  getAuditLogs() { return apiClient<AdminPage>('/admin/audit-logs?page=1&limit=20', { token: token() }); },
  getReports(path: string, startDate?: string, endDate?: string) { const query = new URLSearchParams(); if (startDate) query.set('startDate', startDate); if (endDate) query.set('endDate', endDate); const suffix = query.size ? `?${query}` : ''; return apiClient<AdminRecord>(`/reports/${path}${suffix}`, { token: token() }); },
  updateOrderStatus(id: string, status: string) { return apiClient(`/orders/${id}/status`, { method: 'PATCH', token: token(), body: JSON.stringify({ status }) }); },
  updatePaymentStatus(id: string, status: string, transactionReference?: string) { return apiClient(`/payments/${id}/status`, { method: 'PATCH', token: token(), body: JSON.stringify({ status, transactionReference }) }); },
  updateDelivery(id: string, data: AdminRecord) { return apiClient(`/deliveries/${id}`, { method: 'PATCH', token: token(), body: JSON.stringify(data) }); },
  createDelivery(data: AdminRecord) { return apiClient('/deliveries', { method: 'POST', token: token(), body: JSON.stringify(data) }); },
  updateInfluencer(id: string, data: AdminRecord) { return apiClient(`/influencers/${id}`, { method: 'PATCH', token: token(), body: JSON.stringify(data) }); },
  approveInfluencer(id: string) { return apiClient(`/influencers/${id}/approve`, { method: 'PATCH', token: token() }); },
  updateProduct(id: string, data: AdminRecord) { return apiClient(`/products/${id}`, { method: 'PATCH', token: token(), body: JSON.stringify(data) }); },
  createProduct(data: AdminRecord) { return apiClient<AdminRecord>('/products', { method: 'POST', token: token(), body: JSON.stringify(data) }); },
  getProductOptions(type: 'COLOR' | 'EDITION') { return apiClient<AdminRecord[]>(`/product-options?type=${type}`, { token: token() }); },
  createProductOption(type: 'COLOR' | 'EDITION', name: string) { return apiClient('/product-options', { method: 'POST', token: token(), body: JSON.stringify({ type, name }) }); },
  updateProductOption(id: string, name: string) { return apiClient(`/product-options/${id}`, { method: 'PATCH', token: token(), body: JSON.stringify({ name }) }); },
  deleteProductOption(id: string) { return apiClient(`/product-options/${id}`, { method: 'DELETE', token: token() }); },
  createCategory(data: AdminRecord) { return apiClient('/categories', { method: 'POST', token: token(), body: JSON.stringify(data) }); },
  createBrand(data: AdminRecord) { return apiClient('/brands', { method: 'POST', token: token(), body: JSON.stringify(data) }); },
  updateCategory(id: string, data: AdminRecord) { return apiClient(`/categories/${id}`, { method: 'PATCH', token: token(), body: JSON.stringify(data) }); },
  updateBrand(id: string, data: AdminRecord) { return apiClient(`/brands/${id}`, { method: 'PATCH', token: token(), body: JSON.stringify(data) }); },
  deleteCategory(id: string) { return apiClient(`/categories/${id}`, { method: 'DELETE', token: token() }); },
  deleteBrand(id: string) { return apiClient(`/brands/${id}`, { method: 'DELETE', token: token() }); },
  createBanner(data: AdminRecord) { return apiClient('/cms/banners', { method: 'POST', token: token(), body: JSON.stringify(data) }); },
  createPromotion(data: AdminRecord) { return apiClient('/cms/promotions', { method: 'POST', token: token(), body: JSON.stringify(data) }); },
  deleteBanner(id: string) { return apiClient(`/cms/banners/${id}`, { method: 'DELETE', token: token() }); },
  deletePromotion(id: string) { return apiClient(`/cms/promotions/${id}`, { method: 'DELETE', token: token() }); },
  updateBanner(id: string, data: AdminRecord) { return apiClient(`/cms/banners/${id}`, { method: 'PATCH', token: token(), body: JSON.stringify(data) }); },
  updatePromotion(id: string, data: AdminRecord) { return apiClient(`/cms/promotions/${id}`, { method: 'PATCH', token: token(), body: JSON.stringify(data) }); },
  updateInventory(variantId: string, data: AdminRecord) { return apiClient(`/inventory/${variantId}`, { method: 'PATCH', token: token(), body: JSON.stringify(data) }); },
  getInventoryMovements(variantId: string) { return apiClient<AdminRecord[]>(`/inventory/movements/${variantId}`, { token: token() }); },
  createInventoryMovement(data: AdminRecord) { return apiClient('/inventory/movements', { method: 'POST', token: token(), body: JSON.stringify(data) }); },
  importInventory(rows: Array<{ sku: string; quantity: number; minStock?: number }>) { return apiClient<{ imported: number }>('/inventory/movements/import', { method: 'POST', token: token(), body: JSON.stringify({ rows }) }); },
  updateUser(id: string, data: AdminRecord) { return apiClient(`/admin/users/${id}`, { method: 'PATCH', token: token(), body: JSON.stringify(data) }); },
  createUser(data: AdminRecord) { return apiClient('/admin/users', { method: 'POST', token: token(), body: JSON.stringify(data) }); },
  createRole(data: AdminRecord) { return apiClient('/admin/roles', { method: 'POST', token: token(), body: JSON.stringify(data) }); },
  updateRole(id: string, data: AdminRecord) { return apiClient(`/admin/roles/${id}`, { method: 'PATCH', token: token(), body: JSON.stringify(data) }); },
  updateSetting(key: string, value: string, description?: string) { return apiClient(`/admin/settings/${encodeURIComponent(key)}`, { method: 'PATCH', token: token(), body: JSON.stringify({ value, description }) }); },
};
