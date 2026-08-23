import { Injectable } from '@nestjs/common';
import { PurchaseRepository } from '../../domain/repositories/purchase.repository';

@Injectable()
export class GetPurchasesUseCase {
  constructor(private readonly purchaseRepository: PurchaseRepository) {}

  async execute() {
    return this.purchaseRepository.findAll();
  }
}
