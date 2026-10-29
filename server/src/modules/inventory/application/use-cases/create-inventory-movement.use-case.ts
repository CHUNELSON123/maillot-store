import { BadRequestException, Injectable } from '@nestjs/common';
import { InventoryMovementRepository } from '../../domain/repositories/inventory-movement.repository';

export interface CreateInventoryMovementInput {
  variantId: string;
  quantity: number;
  movementType: string;
  reference?: string;
}

@Injectable()
export class CreateInventoryMovementUseCase {
  constructor(
    private readonly inventoryMovementRepository: InventoryMovementRepository,
  ) {}

  async execute(input: CreateInventoryMovementInput) {
    const movementType = input.movementType.toUpperCase();

    if (!['STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT', 'DAMAGE', 'LOST'].includes(movementType)) {
      throw new BadRequestException('Invalid movement type');
    }

    if (movementType !== 'ADJUSTMENT' && input.quantity <= 0) {
      throw new BadRequestException(
        'Stock in/out quantity must be greater than zero',
      );
    }

    return this.inventoryMovementRepository.create({
      variantId: input.variantId,
      quantity: input.quantity,
      movementType,
      reference: input.reference,
    });
  }
}
