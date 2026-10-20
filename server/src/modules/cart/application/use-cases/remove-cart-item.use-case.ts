import { Injectable } from '@nestjs/common';
import { CartRepository } from '../../domain/repositories/cart.repository';

@Injectable()
export class RemoveCartItemUseCase {
  constructor(private readonly cartRepository: CartRepository) {}

  async execute(customerId: string, cartItemId: string): Promise<void> {
    await this.cartRepository.removeItem(customerId, cartItemId);
  }
}
