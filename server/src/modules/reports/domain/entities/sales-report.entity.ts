export class SalesReportEntity {
  constructor(
    public readonly totalOrders: number,
    public readonly confirmedOrders: number,
    public readonly cancelledOrders: number,
    public readonly totalSales: number,
    public readonly periodStart: Date | null,
    public readonly periodEnd: Date | null,
    public readonly revenueOverTime: Array<{ label: string; value: number }>,
    public readonly ordersOverTime: Array<{ label: string; value: number }>,
    public readonly topProducts: Array<{ id: string; name: string; quantity: number; revenue: number }>,
    public readonly salesBySource: Array<{ source: string; orders: number; revenue: number }>,
  ) {}
}
