import { ConflictException, Injectable } from '@nestjs/common';
import { InventoryRepository } from '../../domain/repositories/inventory.repository';

export interface CreateInventoryInput {
  variantId: string;
  quantity?: number;
  minStock?: number;
}

@Injectable()
export class CreateInventoryUseCase {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async execute(input: CreateInventoryInput) {
    const existingInventory = await this.inventoryRepository.findByVariantId(
      input.variantId,
    );

    if (existingInventory) {
      throw new ConflictException('Inventory already exists for this variant');
    }

    return this.inventoryRepository.create(input);
  }
}
