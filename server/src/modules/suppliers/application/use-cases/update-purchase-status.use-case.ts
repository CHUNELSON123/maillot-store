import { BadRequestException, Injectable } from '@nestjs/common';
import { PurchaseRepository } from '../../domain/repositories/purchase.repository';

export interface UpdatePurchaseStatusInput {
  status: string;
}

@Injectable()
export class UpdatePurchaseStatusUseCase {
  constructor(private readonly purchaseRepository: PurchaseRepository) {}

  async execute(purchaseId: string, input: UpdatePurchaseStatusInput) {
    const status = input.status.toUpperCase();

    if (!['PENDING', 'CONFIRMED', 'CANCELLED'].includes(status)) {
      throw new BadRequestException('Invalid purchase status');
    }

    return this.purchaseRepository.updateStatus(purchaseId, { status });
  }
}
