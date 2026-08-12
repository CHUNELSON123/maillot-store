import { Injectable, NotFoundException } from '@nestjs/common';
import { InventoryRepository } from '../../domain/repositories/inventory.repository';

@Injectable()
export class GetInventoryUseCase {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async execute(variantId: string) {
    const inventory = await this.inventoryRepository.findByVariantId(variantId);

    if (!inventory) {
      throw new NotFoundException('Inventory not found for this variant');
    }

    return inventory;
  }
}
