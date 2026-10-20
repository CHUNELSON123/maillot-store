import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import {
  applyInventoryDelta,
  setInventoryQuantity,
} from '../../../../infrastructure/database/inventory-stock';
import { InventoryEntity } from '../../domain/entities/inventory.entity';
import {
  CreateInventoryData,
  InventoryRepository,
  UpdateInventoryData,
} from '../../domain/repositories/inventory.repository';

@Injectable()
export class PrismaInventoryRepository implements InventoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateInventoryData): Promise<InventoryEntity> {
    if (
      data.quantity !== undefined &&
      (!Number.isSafeInteger(data.quantity) || data.quantity < 0)
    ) {
      throw new BadRequestException(
        'Inventory quantity must be a non-negative integer',
      );
    }

    const inventory = await this.prisma.$transaction(async (tx) => {
      const created = await tx.inventory.create({
        data: {
          variant_id: data.variantId,
          quantity: 0,
          min_stock: data.minStock ?? 0,
        },
      });

      if ((data.quantity ?? 0) > 0) {
        await applyInventoryDelta(
          tx,
          data.variantId,
          data.quantity!,
          'STOCK_IN',
          'Initial stock',
        );
      }

      return tx.inventory.findUniqueOrThrow({ where: { id: created.id } });
    });

    return new InventoryEntity(
      inventory.id,
      inventory.variant_id,
      inventory.quantity,
      inventory.min_stock,
      inventory.created_at,
      inventory.updated_at,
    );
  }

  async findByVariantId(variantId: string): Promise<InventoryEntity | null> {
    const inventory = await this.prisma.inventory.findFirst({
      where: {
        variant_id: variantId,
        deleted_at: null,
      },
    });

    if (!inventory) {
      return null;
    }

    return new InventoryEntity(
      inventory.id,
      inventory.variant_id,
      inventory.quantity,
      inventory.min_stock,
      inventory.created_at,
      inventory.updated_at,
    );
  }

  async update(
    variantId: string,
    data: UpdateInventoryData,
  ): Promise<InventoryEntity> {
    const inventory = await this.prisma.$transaction(async (tx) => {
      if (data.quantity !== undefined) {
        await setInventoryQuantity(
          tx,
          variantId,
          data.quantity,
          'Manual inventory quantity adjustment',
        );
      }

      return tx.inventory.update({
        where: { variant_id: variantId },
        data: {
          ...(data.minStock !== undefined && { min_stock: data.minStock }),
        },
      });
    });

    return new InventoryEntity(
      inventory.id,
      inventory.variant_id,
      inventory.quantity,
      inventory.min_stock,
      inventory.created_at,
      inventory.updated_at,
    );
  }

  async findLowStock(): Promise<InventoryEntity[]> {
    const inventories = await this.prisma.inventory.findMany({
      where: {
        deleted_at: null,
      },
    });

    return inventories
      .filter((inventory) => inventory.quantity <= inventory.min_stock)
      .map(
        (inventory) =>
          new InventoryEntity(
            inventory.id,
            inventory.variant_id,
            inventory.quantity,
            inventory.min_stock,
            inventory.created_at,
            inventory.updated_at,
          ),
      );
  }

  async deductStock(
    variantId: string,
    quantity: number,
    reference: string,
  ): Promise<InventoryEntity> {
    const updatedInventory = await this.prisma.$transaction(async (tx) => {
      await applyInventoryDelta(
        tx,
        variantId,
        -quantity,
        'STOCK_OUT',
        reference,
      );

      return tx.inventory.findFirstOrThrow({
        where: { variant_id: variantId, deleted_at: null },
      });
    });

    return new InventoryEntity(
      updatedInventory.id,
      updatedInventory.variant_id,
      updatedInventory.quantity,
      updatedInventory.min_stock,
      updatedInventory.created_at,
      updatedInventory.updated_at,
    );
  }
}
