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

  async getSummary() {
    const [summary] = await this.prisma.$queryRaw<{
      total_items: bigint;
      total_quantity: bigint;
      low_stock_items: bigint;
      out_of_stock_items: bigint;
    }[]>`
      SELECT
        COUNT(*)::bigint AS total_items,
        COALESCE(SUM(quantity), 0)::bigint AS total_quantity,
        COUNT(*) FILTER (WHERE quantity > 0 AND quantity <= min_stock)::bigint AS low_stock_items,
        COUNT(*) FILTER (WHERE quantity = 0)::bigint AS out_of_stock_items
      FROM inventory
      WHERE deleted_at IS NULL
    `;
    return {
      totalItems: Number(summary?.total_items ?? 0),
      totalQuantity: Number(summary?.total_quantity ?? 0),
      lowStockItems: Number(summary?.low_stock_items ?? 0),
      outOfStockItems: Number(summary?.out_of_stock_items ?? 0),
    };
  }

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
      const thresholdSetting = await tx.systemSetting.findFirst({
        where: { key: 'low_stock_threshold', deleted_at: null },
        select: { value: true },
      });
      const configuredThreshold = Number(thresholdSetting?.value);
      const created = await tx.inventory.create({
        data: {
          variant_id: data.variantId,
          quantity: 0,
          min_stock: data.minStock ?? (Number.isSafeInteger(configuredThreshold) && configuredThreshold >= 0 ? configuredThreshold : 0),
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
