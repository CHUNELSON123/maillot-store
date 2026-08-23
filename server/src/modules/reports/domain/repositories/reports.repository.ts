import { SalesReportEntity } from '../entities/sales-report.entity';
import { InventoryReportEntity } from '../entities/inventory-report.entity';
import { CommissionReportEntity } from '../entities/commission-report.entity';
import { CustomerReportEntity } from '../entities/customer-report.entity';
import { DashboardSummaryEntity } from '../entities/dashboard-summary.entity';

export interface ReportFilter {
  startDate?: Date;
  endDate?: Date;
}

export abstract class ReportsRepository {
  abstract getSalesReport(filter?: ReportFilter): Promise<SalesReportEntity>;

  abstract getInventoryReport(): Promise<InventoryReportEntity>;

  abstract getCommissionReport(
    filter?: ReportFilter,
  ): Promise<CommissionReportEntity>;

  abstract getCustomerReport(): Promise<CustomerReportEntity>;

  abstract getDashboardSummary(): Promise<DashboardSummaryEntity>;
}
