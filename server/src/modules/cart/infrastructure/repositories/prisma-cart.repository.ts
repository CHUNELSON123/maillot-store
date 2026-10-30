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

  private async assertAvailableStock(
    variantId: string | null,
    requestedQuantity: number,
  ): Promise<void> {
    if (
      !Number.isSafeInteger(requestedQuantity) ||
      requestedQuantity < 1
    ) {
      throw new BadRequestException(
        'Quantity must be a positive integer',
      );
    }

    if (!variantId) {
      throw new BadRequestException(
        'A product variant must be selected before adding to cart',
      );
    }

    const variant = await this.prisma.productVariant.findFirst({
      where: {
        id: variantId,
        deleted_at: null,
        status: 'ACTIVE',
      },
      select: {
        inventory: {
          select: {
            quantity: true,
            deleted_at: true,
          },
        },
      },
    });

    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }

    const inventory = variant.inventory;

    if (!inventory || inventory.deleted_at !== null) {
      throw new BadRequestException(
        'This variant is currently out of stock',
      );
    }

    if (requestedQuantity > inventory.quantity) {
      throw new BadRequestException(
        `Only ${inventory.quantity} unit(s) are currently available`,
      );
    }
  }

  async findByCustomerId(
    customerId: string,
  ): Promise<CartItemEntity[]> {
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
        status: 'ACTIVE',
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
          status: 'ACTIVE',
        },
      });

      if (!variant) {
        throw new NotFoundException(
          'Product variant not found or inactive',
        );
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

    const requestedTotal =
      quantity + (existingItem?.quantity ?? 0);

    await this.assertAvailableStock(variantId, requestedTotal);

    if (existingItem) {
      const updated = await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: requestedTotal,
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
            quantity,
          },
          include: cartItemInclude,
        })
      : await this.prisma.cartItem.create({
          data: {
            customer_id: customerId,
            product_id: productId,
            variant_id: variantId,
            quantity,
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

    const targetVariantId =
      variantId !== undefined ? variantId : item.variant_id;

    if (targetVariantId !== null) {
      const variant = await this.prisma.productVariant.findFirst({
        where: {
          id: targetVariantId,
          product_id: item.product_id,
          deleted_at: null,
          status: 'ACTIVE',
        },
      });

      if (!variant) {
        throw new NotFoundException(
          'Variant not found or inactive for this product',
        );
      }
    }

    const requestedQuantity = quantity ?? item.quantity;

    const matchingItem =
      targetVariantId !== item.variant_id
        ? await this.prisma.cartItem.findFirst({
            where: {
              customer_id: customerId,
              product_id: item.product_id,
              variant_id: targetVariantId,
              deleted_at: null,
              id: { not: cartItemId },
            },
          })
        : null;

    const finalQuantity =
      requestedQuantity + (matchingItem?.quantity ?? 0);

    await this.assertAvailableStock(
      targetVariantId,
      finalQuantity,
    );

    if (matchingItem) {
      await this.prisma.cartItem.update({
        where: { id: cartItemId },
        data: { deleted_at: new Date() },
      });

      const merged = await this.prisma.cartItem.update({
        where: { id: matchingItem.id },
        data: { quantity: finalQuantity },
        include: cartItemInclude,
      });

      return mapToEntity(merged);
    }

    const updated = await this.prisma.cartItem.update({
      where: { id: cartItemId },
      data: {
        quantity: requestedQuantity,
        variant_id: targetVariantId,
      },
      include: cartItemInclude,
    });

    return mapToEntity(updated);
  }

  async removeItem(
    customerId: string,
    cartItemId: string,
  ): Promise<void> {
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
        // Skip unresolvable or unavailable items during cart sync.
      }
    }

    return this.findByCustomerId(customerId);
  }
}