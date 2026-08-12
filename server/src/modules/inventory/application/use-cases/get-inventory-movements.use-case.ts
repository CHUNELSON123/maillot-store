import { Injectable } from '@nestjs/common';
import { InventoryMovementRepository } from '../../domain/repositories/inventory-movement.repository';

@Injectable()
export class GetInventoryMovementsUseCase {
  constructor(
    private readonly inventoryMovementRepository: InventoryMovementRepository,
  ) {}

  async execute(variantId: string) {
    return this.inventoryMovementRepository.findByVariantId(variantId);
  }
}
