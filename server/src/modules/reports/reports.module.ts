import { Module } from '@nestjs/common';

import { ReportsController } from './presentation/controllers/reports.controller';

import { PrismaReportsRepository } from './infrastructure/repositories/prisma-reports.repository';
import { ReportsRepository } from './domain/repositories/reports.repository';

import { GetSalesReportUseCase } from './application/use-cases/get-sales-report.use-case';
import { GetInventoryReportUseCase } from './application/use-cases/get-inventory-report.use-case';
import { GetCommissionReportUseCase } from './application/use-cases/get-commission-report.use-case';
import { GetCustomerReportUseCase } from './application/use-cases/get-customer-report.use-case';
import { GetDashboardSummaryUseCase } from './application/use-cases/get-dashboard-summary.use-case';

@Module({
  controllers: [ReportsController],

  providers: [
    PrismaReportsRepository,

    GetSalesReportUseCase,
    GetInventoryReportUseCase,
    GetCommissionReportUseCase,
    GetCustomerReportUseCase,
    GetDashboardSummaryUseCase,

    {
      provide: ReportsRepository,
      useExisting: PrismaReportsRepository,
    },
  ],

  exports: [ReportsRepository],
})
export class ReportsModule {}
