import { Injectable } from '@nestjs/common';
import { InventoryRepository } from '../../domain/repositories/inventory.repository';

@Injectable()
export class GetLowStockUseCase {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async execute() {
    return this.inventoryRepository.findLowStock();
  }
}
