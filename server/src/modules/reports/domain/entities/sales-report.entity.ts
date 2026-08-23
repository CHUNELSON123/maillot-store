export class SalesReportEntity {
  constructor(
    public readonly totalOrders: number,
    public readonly confirmedOrders: number,
    public readonly cancelledOrders: number,
    public readonly totalSales: number,
    public readonly periodStart: Date | null,
    public readonly periodEnd: Date | null,
  ) {}
}
