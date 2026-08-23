import { Injectable } from '@nestjs/common';
import {
  ReportFilter,
  ReportsRepository,
} from '../../domain/repositories/reports.repository';

@Injectable()
export class GetCommissionReportUseCase {
  constructor(private readonly reportsRepository: ReportsRepository) {}

  execute(filter?: ReportFilter) {
    return this.reportsRepository.getCommissionReport(filter);
  }
}
