import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { CartRepository } from '../../domain/repositories/cart.repository';
import { CartItemEntity } from '../../domain/entities/cart-item.entity';

const cartItemInclude = {
  product: {
    include: {
      images: {
        where: { deleted_at: null },
        orderBy: [
          { is_primary: 'desc' as const },
          { created_at: 'asc' as const },
        ],
        take: 1,
      },
    },
  },
  variant: true,
};

function mapToEntity(item: any): CartItemEntity {
  return new CartItemEntity(
    item.id,
    item.customer_id,
    item.product_id,
    item.variant_id,
    item.quantity,
    item.created_at,
    item.updated_at,
    {
      id: item.product.id,
      name: item.product.name,
      price: Number(item.product.price),
      imageUrl: item.product.images?.[0]?.image_url ?? null,
    },
    item.variant
      ? {
          id: item.variant.id,
          sku: item.variant.sku,
          size: item.variant.size,
          color: item.variant.color,
          edition: item.variant.edition,
          price:
            item.variant.price !== null
              ? Number(item.variant.price)
              : null,
        }
      : null,
  );
}

@Injectable()
export class PrismaCartRepository implements CartRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByCustomerId(customerId: string): Promise<CartItemEntity[]> {
    const items = await this.prisma.cartItem.findMany({
      where: {
        customer_id: customerId,
        deleted_at: null,
        product: {
          deleted_at: null,
        },
      },
      include: cartItemInclude,
      orderBy: { created_at: 'asc' },
    });

    return items.map(mapToEntity);
  }

  async addItem(
    customerId: string,
    productId: string,
    variantId: string | null,
    quantity: number,
  ): Promise<CartItemEntity> {
    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        deleted_at: null,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (variantId) {
      const variant = await this.prisma.productVariant.findFirst({
        where: {
          id: variantId,
          product_id: productId,
          deleted_at: null,
        },
      });

      if (!variant) {
        throw new NotFoundException('Product variant not found');
      }
    }

    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        customer_id: customerId,
        product_id: productId,
        variant_id: variantId,
        deleted_at: null,
      },
    });

    if (existingItem) {
      const updated = await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
        },
        include: cartItemInclude,
      });

      return mapToEntity(updated);
    }

    const deletedItem = await this.prisma.cartItem.findFirst({
      where: {
        customer_id: customerId,
        product_id: productId,
        variant_id: variantId,
        deleted_at: { not: null },
      },
    });

    const item = deletedItem
      ? await this.prisma.cartItem.update({
          where: { id: deletedItem.id },
          data: {
            deleted_at: null,
            quantity: quantity,
          },
          include: cartItemInclude,
        })
      : await this.prisma.cartItem.create({
          data: {
            customer_id: customerId,
            product_id: productId,
            variant_id: variantId,
            quantity: quantity,
          },
          include: cartItemInclude,
        });

    return mapToEntity(item);
  }

  async updateItem(
    customerId: string,
    cartItemId: string,
    quantity?: number,
    variantId?: string | null,
  ): Promise<CartItemEntity> {
    const item = await this.prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        customer_id: customerId,
        deleted_at: null,
      },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    if (quantity !== undefined && quantity <= 0) {
      await this.prisma.cartItem.update({
        where: { id: cartItemId },
        data: { deleted_at: new Date() },
      });
      return mapToEntity(item);
    }

    let targetVariantId = item.variant_id;
    if (variantId !== undefined) {
      if (variantId !== null) {
        const variant = await this.prisma.productVariant.findFirst({
          where: {
            id: variantId,
            product_id: item.product_id,
            deleted_at: null,
          },
        });

        if (!variant) {
          throw new NotFoundException('Variant not found for this product');
        }
      }
      targetVariantId = variantId;

      // Check if another active cart item already has this target variant
      if (targetVariantId !== item.variant_id) {
        const matchingItem = await this.prisma.cartItem.findFirst({
          where: {
            customer_id: customerId,
            product_id: item.product_id,
            variant_id: targetVariantId,
            deleted_at: null,
            id: { not: cartItemId },
          },
        });

        if (matchingItem) {
          const newQuantity = (quantity ?? item.quantity) + matchingItem.quantity;
          await this.prisma.cartItem.update({
            where: { id: cartItemId },
            data: { deleted_at: new Date() },
          });

          const merged = await this.prisma.cartItem.update({
            where: { id: matchingItem.id },
            data: { quantity: newQuantity },
            include: cartItemInclude,
          });

          return mapToEntity(merged);
        }
      }
    }

    const updated = await this.prisma.cartItem.update({
      where: { id: cartItemId },
      data: {
        quantity: quantity !== undefined ? quantity : item.quantity,
        variant_id: targetVariantId,
      },
      include: cartItemInclude,
    });

    return mapToEntity(updated);
  }

  async removeItem(customerId: string, cartItemId: string): Promise<void> {
    const item = await this.prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        customer_id: customerId,
        deleted_at: null,
      },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    await this.prisma.cartItem.update({
      where: { id: cartItemId },
      data: { deleted_at: new Date() },
    });
  }

  async clearCart(customerId: string): Promise<void> {
    await this.prisma.cartItem.updateMany({
      where: {
        customer_id: customerId,
        deleted_at: null,
      },
      data: { deleted_at: new Date() },
    });
  }

  async syncItems(
    customerId: string,
    items: Array<{
      productId: string;
      variantId?: string | null;
      quantity: number;
    }>,
  ): Promise<CartItemEntity[]> {
    for (const item of items) {
      try {
        await this.addItem(
          customerId,
          item.productId,
          item.variantId ?? null,
          item.quantity > 0 ? item.quantity : 1,
        );
      } catch {
        // Skip unresolvable products or variants during sync
      }
    }

    return this.findByCustomerId(customerId);
  }
}
