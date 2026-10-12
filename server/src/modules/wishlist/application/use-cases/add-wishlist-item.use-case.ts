import { Injectable, NotFoundException } from '@nestjs/common';
import { WishlistRepository } from '../../domain/repositories/wishlist.repository';
import { ProductRepository } from '../../../catalogue/domain/repositories/product.repository';

@Injectable()
export class AddWishlistItemUseCase {
  constructor(
    private readonly wishlistRepository: WishlistRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(customerId: string, productId: string) {
    const product = await this.productRepository.findById(productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.wishlistRepository.add(customerId, productId);
  }
}