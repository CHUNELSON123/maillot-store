export class CommissionReportEntity {
  constructor(
    public readonly totalCommissions: number,
    public readonly pendingAmount: number,
    public readonly approvedAmount: number,
    public readonly paidAmount: number,
  ) {}
}
