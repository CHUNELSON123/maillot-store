export type AdminRecord = Record<string, unknown>;
export interface AdminDashboardSummary {
  totalCustomers: number;
  totalOrders: number;
  totalInfluencers: number;
  totalSales: number;
  lowStockItems: number;
  salesOverview: Array<{ label: string; current: number; previous: number }>;
  recentOrders: Array<{ id: string; orderNumber: string; customerName: string; totalAmount: number; paymentStatus: string | null; status: string; createdAt: string }>;
  lowStockAlerts: Array<{ id: string; productName: string; imageUrl: string | null; variantLabel: string; sku: string; quantity: number; minStock: number }>;
  recentActivities: Array<{ id: string; type: 'order' | 'payment' | 'influencer' | 'inventory'; message: string; createdAt: string }>;
  changes: { totalSales: number | null; totalOrders: number | null; totalCustomers: number | null; totalInfluencers: number | null };
  period: { startDate: string; endDate: string; previousStartDate: string; previousEndDate: string };
}
export interface AdminPage<T = AdminRecord> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
export type AdminSection =
  | 'dashboard' | 'products' | 'categories-brands' | 'inventory' | 'orders'
  | 'customers' | 'influencers' | 'payments' | 'delivery' | 'reports'
  | 'cms' | 'users' | 'settings';
