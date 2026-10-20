import { Injectable } from '@nestjs/common';
import { CartRepository } from '../../domain/repositories/cart.repository';
import { CartItemEntity } from '../../domain/entities/cart-item.entity';

@Injectable()
export class AddCartItemUseCase {
  constructor(private readonly cartRepository: CartRepository) {}

  async execute(
    customerId: string,
    productId: string,
    variantId: string | null,
    quantity: number = 1,
  ): Promise<CartItemEntity> {
    return this.cartRepository.addItem(
      customerId,
      productId,
      variantId,
      quantity,
    );
  }
}
