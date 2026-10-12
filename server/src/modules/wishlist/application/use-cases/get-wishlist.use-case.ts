import { Injectable } from '@nestjs/common';
import { WishlistRepository } from '../../domain/repositories/wishlist.repository';

@Injectable()
export class GetWishlistUseCase {
  constructor(
    private readonly wishlistRepository: WishlistRepository,
  ) {}

  execute(customerId: string) {
    return this.wishlistRepository.findByCustomerId(customerId);
  }
}