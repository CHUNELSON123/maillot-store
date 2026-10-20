import { Injectable } from '@nestjs/common';
import { CartRepository } from '../../domain/repositories/cart.repository';
import { CartItemEntity } from '../../domain/entities/cart-item.entity';

@Injectable()
export class GetCartUseCase {
  constructor(private readonly cartRepository: CartRepository) {}

  async execute(customerId: string): Promise<CartItemEntity[]> {
    return this.cartRepository.findByCustomerId(customerId);
  }
}
