import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
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
    const movement = await this.prisma.inventoryMovement.create({
      data: {
        variant_id: data.variantId,
        quantity: data.quantity,
        movement_type: data.movementType,
        reference: data.reference,
      },
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
