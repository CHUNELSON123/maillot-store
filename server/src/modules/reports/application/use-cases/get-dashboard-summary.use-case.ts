import { BadRequestException, Injectable } from '@nestjs/common';
import { ReportFilter, ReportsRepository } from '../../domain/repositories/reports.repository';

@Injectable()
export class GetDashboardSummaryUseCase {
  constructor(private readonly reportsRepository: ReportsRepository) {}

  execute(filter?: ReportFilter) {
    if (filter?.startDate && filter.endDate && filter.startDate > filter.endDate) {
      throw new BadRequestException('Start date must be on or before end date');
    }
    return this.reportsRepository.getDashboardSummary(filter);
  }
}
