import { WishlistItemEntity } from '../entities/wishlist-item.entity';

export abstract class WishlistRepository {
  abstract findByCustomerId(
    customerId: string,
  ): Promise<WishlistItemEntity[]>;

  abstract add(
    customerId: string,
    productId: string,
  ): Promise<WishlistItemEntity>;

  abstract remove(
    customerId: string,
    productId: string,
  ): Promise<void>;
}