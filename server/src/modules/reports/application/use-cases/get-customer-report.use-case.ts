import { Injectable } from '@nestjs/common';
import { ReportsRepository } from '../../domain/repositories/reports.repository';

@Injectable()
export class GetCustomerReportUseCase {
  constructor(private readonly reportsRepository: ReportsRepository) {}

  execute() {
    return this.reportsRepository.getCustomerReport();
  }
}
