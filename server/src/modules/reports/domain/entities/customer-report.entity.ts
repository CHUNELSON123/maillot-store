export class CustomerReportEntity {
  constructor(
    public readonly totalCustomers: number,
    public readonly activeCustomers: number,
    public readonly customersWithOrders: number,
  ) {}
}
