import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommissionRepository } from '../../domain/repositories/commission.repository';

export interface UpdateCommissionStatusInput {
  status: string;
}

@Injectable()
export class UpdateCommissionStatusUseCase {
  constructor(private readonly commissionRepository: CommissionRepository) {}

  async execute(commissionId: string, input: UpdateCommissionStatusInput) {
    const commission = await this.commissionRepository.findById(commissionId);

    if (!commission) {
      throw new NotFoundException('Commission not found');
    }

    const status = input.status.trim().toUpperCase();

    const allowedStatuses = ['PENDING', 'APPROVED', 'PAID'];

    if (!allowedStatuses.includes(status)) {
      throw new BadRequestException('Invalid commission status');
    }

    if (commission.status === 'PAID' && status !== 'PAID') {
      throw new BadRequestException('Paid commission cannot be changed');
    }

    return this.commissionRepository.updateStatus(commissionId, status);
  }
}
