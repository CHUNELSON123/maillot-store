import { Injectable } from '@nestjs/common';
import { CartRepository } from '../../domain/repositories/cart.repository';
import { CartItemEntity } from '../../domain/entities/cart-item.entity';

@Injectable()
export class UpdateCartItemUseCase {
  constructor(private readonly cartRepository: CartRepository) {}

  async execute(
    customerId: string,
    cartItemId: string,
    quantity?: number,
    variantId?: string | null,
  ): Promise<CartItemEntity> {
    return this.cartRepository.updateItem(
      customerId,
      cartItemId,
      quantity,
      variantId,
    );
  }
}
