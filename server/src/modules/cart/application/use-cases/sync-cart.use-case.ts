import { Injectable } from '@nestjs/common';
import { CartRepository } from '../../domain/repositories/cart.repository';
import { CartItemEntity } from '../../domain/entities/cart-item.entity';

@Injectable()
export class SyncCartUseCase {
  constructor(private readonly cartRepository: CartRepository) {}

  async execute(
    customerId: string,
    items: Array<{
      productId: string;
      variantId?: string | null;
      quantity: number;
    }>,
  ): Promise<CartItemEntity[]> {
    return this.cartRepository.syncItems(customerId, items);
  }
}
