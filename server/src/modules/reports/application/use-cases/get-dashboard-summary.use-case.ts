import { Injectable } from '@nestjs/common';
import { ReportsRepository } from '../../domain/repositories/reports.repository';

@Injectable()
export class GetDashboardSummaryUseCase {
  constructor(private readonly reportsRepository: ReportsRepository) {}

  execute() {
    return this.reportsRepository.getDashboardSummary();
  }
}
