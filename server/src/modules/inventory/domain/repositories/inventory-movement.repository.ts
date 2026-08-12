import { InventoryMovementEntity } from '../entities/inventory-movement.entity';

export interface CreateInventoryMovementData {
  variantId: string;
  quantity: number;
  movementType: string;
  reference?: string;
}

export abstract class InventoryMovementRepository {
  abstract create(
    data: CreateInventoryMovementData,
  ): Promise<InventoryMovementEntity>;

  abstract findByVariantId(
    variantId: string,
  ): Promise<InventoryMovementEntity[]>;
}
