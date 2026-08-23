import { BadRequestException, Injectable } from '@nestjs/common';
import { PurchaseRepository } from '../../domain/repositories/purchase.repository';

export interface CreatePurchaseItemInput {
  variantId: string;
  quantity: number;
  unitCost: number;
}

export interface CreatePurchaseInput {
  supplierId: string;
  purchaseNumber: string;
  purchaseDate?: Date;
  items: CreatePurchaseItemInput[];
}

@Injectable()
export class CreatePurchaseUseCase {
  constructor(private readonly purchaseRepository: PurchaseRepository) {}

  async execute(input: CreatePurchaseInput) {
    if (!input.supplierId) {
      throw new BadRequestException('Supplier is required');
    }

    if (!input.purchaseNumber.trim()) {
      throw new BadRequestException('Purchase number is required');
    }

    if (input.items.length === 0) {
      throw new BadRequestException('Purchase must contain at least one item');
    }

    return this.purchaseRepository.create({
      supplierId: input.supplierId,
      purchaseNumber: input.purchaseNumber.trim(),
      purchaseDate: input.purchaseDate,
      status: 'PENDING',
      items: input.items,
    });
  }
}
