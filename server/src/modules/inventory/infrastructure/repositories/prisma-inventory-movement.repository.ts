import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import {
  applyInventoryDelta,
  setInventoryQuantity,
} from '../../../../infrastructure/database/inventory-stock';
import { InventoryMovementEntity } from '../../domain/entities/inventory-movement.entity';
import {
  CreateInventoryMovementData,
  InventoryMovementRepository,
} from '../../domain/repositories/inventory-movement.repository';

@Injectable()
export class PrismaInventoryMovementRepository implements InventoryMovementRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: CreateInventoryMovementData,
  ): Promise<InventoryMovementEntity> {
    const movement = await this.prisma.$transaction(async (tx) => {
      if (data.movementType === 'STOCK_IN') {
        return applyInventoryDelta(
          tx,
          data.variantId,
          data.quantity,
          'STOCK_IN',
          data.reference ?? 'Manual stock movement',
        );
      } else if (data.movementType === 'STOCK_OUT') {
        return applyInventoryDelta(
          tx,
          data.variantId,
          -data.quantity,
          'STOCK_OUT',
          data.reference ?? 'Manual stock movement',
        );
      } else if (data.movementType === 'DAMAGE' || data.movementType === 'LOST') {
        return applyInventoryDelta(
          tx,
          data.variantId,
          -data.quantity,
          data.movementType,
          data.reference ?? `Inventory ${data.movementType.toLowerCase()}`,
        );
      } else {
        return setInventoryQuantity(
          tx,
          data.variantId,
          data.quantity,
          data.reference ?? 'Manual stock adjustment',
        );
      }
    });

    return new InventoryMovementEntity(
      movement.id,
      movement.variant_id,
      movement.quantity,
      movement.movement_type,
      movement.reference,
      movement.created_at,
      movement.updated_at,
    );
  }

  async findByVariantId(variantId: string): Promise<InventoryMovementEntity[]> {
    const movements = await this.prisma.inventoryMovement.findMany({
      where: {
        variant_id: variantId,
        deleted_at: null,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return movements.map(
      (movement) =>
        new InventoryMovementEntity(
          movement.id,
          movement.variant_id,
          movement.quantity,
          movement.movement_type,
          movement.reference,
          movement.created_at,
          movement.updated_at,
        ),
    );
  }
}
