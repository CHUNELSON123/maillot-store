import { Injectable } from '@nestjs/common';
import { InventoryRepository } from '../../domain/repositories/inventory.repository';

@Injectable()
export class GetInventorySummaryUseCase {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  execute() {
    return this.inventoryRepository.getSummary();
  }
}
