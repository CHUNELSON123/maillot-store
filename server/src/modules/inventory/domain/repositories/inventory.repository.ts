import { InventoryEntity } from '../entities/inventory.entity';

export interface CreateInventoryData {
  variantId: string;
  quantity?: number;
  minStock?: number;
}

export interface UpdateInventoryData {
  quantity?: number;
  minStock?: number;
}

export abstract class InventoryRepository {
  abstract create(data: CreateInventoryData): Promise<InventoryEntity>;

  abstract findByVariantId(variantId: string): Promise<InventoryEntity | null>;

  abstract update(
    variantId: string,
    data: UpdateInventoryData,
  ): Promise<InventoryEntity>;

  abstract findLowStock(): Promise<InventoryEntity[]>;

  abstract deductStock(
    variantId: string,
    quantity: number,
    reference: string,
  ): Promise<InventoryEntity>;
}
