import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import {
  applyInventoryDelta,
  setInventoryQuantity,
} from '../../../../infrastructure/database/inventory-stock';
import { InventoryMovementEntity } from '../../domain/entities/inventory-movement.entity';
import {
  CreateInventoryMovementData,
  InventoryImportRow,
  InventoryMovementListQuery,
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

  async findAll(query: InventoryMovementListQuery) {
    const where = {
      deleted_at: null,
      ...(query.movementType === 'DAMAGE_LOSS'
        ? { movement_type: { in: ['DAMAGE', 'LOST'] } }
        : query.movementType ? { movement_type: query.movementType } : {}),
      ...(query.search ? { OR: [
        { reference: { contains: query.search, mode: 'insensitive' as const } },
        { variant: { is: { sku: { contains: query.search, mode: 'insensitive' as const } } } },
        { variant: { is: { product: { is: { name: { contains: query.search, mode: 'insensitive' as const } } } } } },
      ] } : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.inventoryMovement.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { created_at: 'desc' },
        include: { variant: { include: { product: { include: { images: { where: { deleted_at: null }, orderBy: [{ is_primary: 'desc' }, { created_at: 'asc' }], take: 1 } } } } } },
      }),
      this.prisma.inventoryMovement.count({ where }),
    ]);
    return { items, total, page: query.page, limit: query.limit };
  }

  async importBySku(rows: InventoryImportRow[]) {
    return this.prisma.$transaction(async (tx) => {
      const variants = await tx.productVariant.findMany({
        where: { sku: { in: rows.map((row) => row.sku) }, deleted_at: null },
        select: { id: true, sku: true },
      });
      const variantsBySku = new Map(variants.map((variant) => [variant.sku, variant]));
      const thresholdSetting = await tx.systemSetting.findFirst({
        where: { key: 'low_stock_threshold', deleted_at: null },
        select: { value: true },
      });
      const defaultThreshold = Number(thresholdSetting?.value);
      const fallbackThreshold = Number.isSafeInteger(defaultThreshold) && defaultThreshold >= 0 ? defaultThreshold : 0;
      const unknownSku = rows.find((row) => !variantsBySku.has(row.sku));
      if (unknownSku) {
        throw new BadRequestException(`SKU not found: ${unknownSku.sku}`);
      }

      for (const row of rows) {
        const variant = variantsBySku.get(row.sku)!;
        let inventory = await tx.inventory.findFirst({ where: { variant_id: variant.id, deleted_at: null } });
        if (!inventory) {
          inventory = await tx.inventory.create({ data: { variant_id: variant.id, quantity: 0, min_stock: row.minStock ?? fallbackThreshold } });
        }
        if (row.minStock !== undefined) {
          await tx.inventory.update({ where: { id: inventory.id }, data: { min_stock: row.minStock } });
        }
        if (row.quantity !== inventory.quantity) {
          await setInventoryQuantity(tx, variant.id, row.quantity, `Stock import (${row.sku})`);
        }
      }
      return { imported: rows.length };
    });
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
