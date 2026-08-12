import { Injectable, NotFoundException } from '@nestjs/common';
import { InventoryRepository } from '../../domain/repositories/inventory.repository';

export interface UpdateInventoryInput {
  quantity?: number;
  minStock?: number;
}

@Injectable()
export class UpdateInventoryUseCase {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async execute(variantId: string, input: UpdateInventoryInput) {
    const existingInventory =
      await this.inventoryRepository.findByVariantId(variantId);

    if (!existingInventory) {
      throw new NotFoundException('Inventory not found for this variant');
    }

    return this.inventoryRepository.update(variantId, input);
  }
}
