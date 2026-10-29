export class DashboardSummaryEntity {
  constructor(
    public readonly totalCustomers: number,
    public readonly totalOrders: number,
    public readonly totalInfluencers: number,
    public readonly totalSales: number,
    public readonly lowStockItems: number,
    public readonly salesOverview: Array<{ label: string; current: number; previous: number }>,
    public readonly recentOrders: Array<{ id: string; orderNumber: string; customerName: string; totalAmount: number; paymentStatus: string | null; status: string; createdAt: Date }>,
    public readonly lowStockAlerts: Array<{ id: string; productName: string; imageUrl: string | null; variantLabel: string; sku: string; quantity: number; minStock: number }>,
    public readonly recentActivities: Array<{ id: string; type: string; message: string; createdAt: Date }>,
    public readonly changes: { totalSales: number | null; totalOrders: number | null; totalCustomers: number | null; totalInfluencers: number | null },
    public readonly period: { startDate: Date; endDate: Date; previousStartDate: Date; previousEndDate: Date },
  ) {}
}
