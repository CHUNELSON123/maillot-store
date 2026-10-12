import { Injectable } from '@nestjs/common';
import { WishlistRepository } from '../../domain/repositories/wishlist.repository';

@Injectable()
export class RemoveWishlistItemUseCase {
  constructor(
    private readonly wishlistRepository: WishlistRepository,
  ) {}

  execute(customerId: string, productId: string): Promise<void> {
    return this.wishlistRepository.remove(customerId, productId);
  }
}