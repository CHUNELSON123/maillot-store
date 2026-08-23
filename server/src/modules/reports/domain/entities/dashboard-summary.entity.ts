export class DashboardSummaryEntity {
  constructor(
    public readonly totalCustomers: number,
    public readonly totalOrders: number,
    public readonly totalSales: number,
    public readonly totalProducts: number,
    public readonly lowStockItems: number,
    public readonly pendingCommissions: number,
  ) {}
}
