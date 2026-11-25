import { InventoryMovementEntity } from '../entities/inventory-movement.entity';

export interface CreateInventoryMovementData {
  variantId: string;
  quantity: number;
  movementType: string;
  reference?: string;
}

export interface InventoryMovementListQuery {
  page: number;
  limit: number;
  search?: string;
  movementType?: string;
}

export interface InventoryImportRow {
  sku: string;
  quantity: number;
  minStock?: number;
}

export abstract class InventoryMovementRepository {
  abstract create(
    data: CreateInventoryMovementData,
  ): Promise<InventoryMovementEntity>;

  abstract findByVariantId(
    variantId: string,
  ): Promise<InventoryMovementEntity[]>;

  abstract findAll(query: InventoryMovementListQuery): Promise<{
    items: unknown[];
    total: number;
    page: number;
    limit: number;
  }>;

  abstract importBySku(rows: InventoryImportRow[]): Promise<{ imported: number }>;
}
