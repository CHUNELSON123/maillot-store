import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from './generated/prisma/client';

type InventoryTransaction = Prisma.TransactionClient;

export async function applyInventoryDelta(
  tx: InventoryTransaction,
  variantId: string,
  delta: number,
  movementType: 'STOCK_IN' | 'STOCK_OUT' | 'DAMAGE' | 'LOST',
  reference: string,
): Promise<
  Awaited<ReturnType<InventoryTransaction['inventoryMovement']['create']>>
> {
  if (!Number.isSafeInteger(delta) || delta === 0) {
    throw new BadRequestException(
      'Inventory change must be a non-zero integer',
    );
  }

  const result = await tx.inventory.updateMany({
    where: {
      variant_id: variantId,
      deleted_at: null,
      ...(delta < 0 && { quantity: { gte: -delta } }),
    },
    data: {
      quantity: delta < 0 ? { decrement: -delta } : { increment: delta },
    },
  });

  if (result.count === 0) {
    const inventory = await tx.inventory.findFirst({
      where: { variant_id: variantId, deleted_at: null },
      select: { id: true },
    });

    if (!inventory) {
      throw new NotFoundException(
        `Inventory not found for variant ${variantId}`,
      );
    }

    throw new ConflictException(`Insufficient stock for variant ${variantId}`);
  }

  return tx.inventoryMovement.create({
    data: {
      variant_id: variantId,
      quantity: Math.abs(delta),
      movement_type: movementType,
      reference,
    },
  });
}

export async function setInventoryQuantity(
  tx: InventoryTransaction,
  variantId: string,
  quantity: number,
  reference: string,
): Promise<
  Awaited<ReturnType<InventoryTransaction['inventoryMovement']['create']>>
> {
  if (!Number.isSafeInteger(quantity) || quantity < 0) {
    throw new BadRequestException(
      'Inventory quantity must be a non-negative integer',
    );
  }

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const inventory = await tx.inventory.findFirst({
      where: { variant_id: variantId, deleted_at: null },
      select: { id: true, quantity: true },
    });

    if (!inventory) {
      throw new NotFoundException(
        `Inventory not found for variant ${variantId}`,
      );
    }

    const delta = quantity - inventory.quantity;
    const updated = await tx.inventory.updateMany({
      where: {
        id: inventory.id,
        quantity: inventory.quantity,
        deleted_at: null,
      },
      data: { quantity },
    });

    if (updated.count === 0) {
      continue;
    }

    return tx.inventoryMovement.create({
      data: {
        variant_id: variantId,
        quantity: delta,
        movement_type: 'ADJUSTMENT',
        reference,
      },
    });
  }

  throw new ConflictException(
    'Inventory changed repeatedly; retry the adjustment',
  );
}
