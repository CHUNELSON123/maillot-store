import { Injectable, NotFoundException } from '@nestjs/common';
import { PurchaseRepository } from '../../domain/repositories/purchase.repository';

@Injectable()
export class GetPurchaseUseCase {
  constructor(private readonly purchaseRepository: PurchaseRepository) {}

  async execute(purchaseId: string) {
    const purchase = await this.purchaseRepository.findById(purchaseId);

    if (!purchase) {
      throw new NotFoundException('Purchase not found');
    }

    return purchase;
  }
}
