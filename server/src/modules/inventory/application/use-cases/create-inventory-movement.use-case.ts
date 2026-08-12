import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InventoryRepository } from '../../domain/repositories/inventory.repository';
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
    private readonly inventoryRepository: InventoryRepository,
    private readonly inventoryMovementRepository: InventoryMovementRepository,
  ) {}

  async execute(input: CreateInventoryMovementInput) {
    const inventory = await this.inventoryRepository.findByVariantId(
      input.variantId,
    );

    if (!inventory) {
      throw new NotFoundException('Inventory not found for this variant');
    }

    const movementType = input.movementType.toUpperCase();

    if (!['STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT'].includes(movementType)) {
      throw new BadRequestException('Invalid movement type');
    }

    let newQuantity: number;

    if (movementType === 'STOCK_IN') {
      newQuantity = inventory.quantity + input.quantity;
    } else if (movementType === 'STOCK_OUT') {
      newQuantity = inventory.quantity - input.quantity;

      if (newQuantity < 0) {
        throw new BadRequestException('Insufficient stock');
      }
    } else {
      newQuantity = input.quantity;
    }

    await this.inventoryRepository.update(input.variantId, {
      quantity: newQuantity,
    });

    return this.inventoryMovementRepository.create({
      variantId: input.variantId,
      quantity: input.quantity,
      movementType,
      reference: input.reference,
    });
  }
}
