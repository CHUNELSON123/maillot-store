import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';

import { GetSalesReportUseCase } from '../../application/use-cases/get-sales-report.use-case';
import { GetInventoryReportUseCase } from '../../application/use-cases/get-inventory-report.use-case';
import { GetCommissionReportUseCase } from '../../application/use-cases/get-commission-report.use-case';
import { GetCustomerReportUseCase } from '../../application/use-cases/get-customer-report.use-case';
import { GetDashboardSummaryUseCase } from '../../application/use-cases/get-dashboard-summary.use-case';

import { ReportFilterDto } from '../dto/report-filter.dto';

@Controller({
  path: 'reports',
  version: '1',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Administrator', 'Staff')
export class ReportsController {
  constructor(
    private readonly getSalesReportUseCase: GetSalesReportUseCase,
    private readonly getInventoryReportUseCase: GetInventoryReportUseCase,
    private readonly getCommissionReportUseCase: GetCommissionReportUseCase,
    private readonly getCustomerReportUseCase: GetCustomerReportUseCase,
    private readonly getDashboardSummaryUseCase: GetDashboardSummaryUseCase,
  ) {}

  @Get('dashboard')
  getDashboardSummary() {
    return this.getDashboardSummaryUseCase.execute();
  }

  @Get('sales')
  getSalesReport(@Query() dto: ReportFilterDto) {
    return this.getSalesReportUseCase.execute({
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
    });
  }

  @Get('inventory')
  getInventoryReport() {
    return this.getInventoryReportUseCase.execute();
  }

  @Get('commissions')
  getCommissionReport(@Query() dto: ReportFilterDto) {
    return this.getCommissionReportUseCase.execute({
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
    });
  }

  @Get('customers')
  getCustomerReport() {
    return this.getCustomerReportUseCase.execute();
  }
}
