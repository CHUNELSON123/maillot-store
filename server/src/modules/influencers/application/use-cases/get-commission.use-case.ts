import { Injectable, NotFoundException } from '@nestjs/common';
import { CommissionRepository } from '../../domain/repositories/commission.repository';

@Injectable()
export class GetCommissionUseCase {
  constructor(private readonly commissionRepository: CommissionRepository) {}

  async execute(commissionId: string) {
    const commission = await this.commissionRepository.findById(commissionId);

    if (!commission) {
      throw new NotFoundException('Commission not found');
    }

    return commission;
  }
}
