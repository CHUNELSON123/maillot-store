import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
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
    const inventory = await this.prisma.inventory.create({
      data: {
        variant_id: data.variantId,
        quantity: data.quantity ?? 0,
        min_stock: data.minStock ?? 0,
      },
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
    const inventory = await this.prisma.inventory.update({
      where: {
        variant_id: variantId,
      },
      data: {
        ...(data.quantity !== undefined && {
          quantity: data.quantity,
        }),
        ...(data.minStock !== undefined && {
          min_stock: data.minStock,
        }),
      },
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
    const inventory = await this.prisma.inventory.findFirst({
      where: {
        variant_id: variantId,
        deleted_at: null,
      },
    });

    if (!inventory) {
      throw new Error('Inventory not found');
    }

    if (inventory.quantity < quantity) {
      throw new Error('Insufficient stock');
    }

    const updatedInventory = await this.prisma.inventory.update({
      where: {
        variant_id: variantId,
      },
      data: {
        quantity: {
          decrement: quantity,
        },
      },
    });

    await this.prisma.inventoryMovement.create({
      data: {
        variant_id: variantId,
        quantity,
        movement_type: 'STOCK_OUT',
        reference,
      },
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
