import { Injectable } from '@nestjs/common';
import { InventoryMovementListQuery, InventoryMovementRepository } from '../../domain/repositories/inventory-movement.repository';

@Injectable()
export class GetInventoryMovementsUseCase {
  constructor(
    private readonly inventoryMovementRepository: InventoryMovementRepository,
  ) {}

  async execute(variantId: string) {
    return this.inventoryMovementRepository.findByVariantId(variantId);
  }

  executeAll(query: InventoryMovementListQuery) {
    return this.inventoryMovementRepository.findAll(query);
  }
}
