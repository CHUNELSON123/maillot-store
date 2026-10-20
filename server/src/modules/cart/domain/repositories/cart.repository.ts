import { CartItemEntity } from '../entities/cart-item.entity';

export abstract class CartRepository {
  abstract findByCustomerId(customerId: string): Promise<CartItemEntity[]>;

  abstract addItem(
    customerId: string,
    productId: string,
    variantId: string | null,
    quantity: number,
  ): Promise<CartItemEntity>;

  abstract updateItem(
    customerId: string,
    cartItemId: string,
    quantity?: number,
    variantId?: string | null,
  ): Promise<CartItemEntity>;

  abstract removeItem(customerId: string, cartItemId: string): Promise<void>;

  abstract clearCart(customerId: string): Promise<void>;

  abstract syncItems(
    customerId: string,
    items: Array<{
      productId: string;
      variantId?: string | null;
      quantity: number;
    }>,
  ): Promise<CartItemEntity[]>;
}
