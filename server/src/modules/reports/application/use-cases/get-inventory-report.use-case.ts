import { Injectable } from '@nestjs/common';
import { ReportsRepository } from '../../domain/repositories/reports.repository';

@Injectable()
export class GetInventoryReportUseCase {
  constructor(private readonly reportsRepository: ReportsRepository) {}

  execute() {
    return this.reportsRepository.getInventoryReport();
  }
}
