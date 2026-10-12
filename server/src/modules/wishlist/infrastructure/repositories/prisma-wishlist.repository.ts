import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { WishlistRepository } from '../../domain/repositories/wishlist.repository';
import { WishlistItemEntity } from '../../domain/entities/wishlist-item.entity';

@Injectable()
export class PrismaWishlistRepository implements WishlistRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByCustomerId(
    customerId: string,
  ): Promise<WishlistItemEntity[]> {
    const items = await this.prisma.wishlistItem.findMany({
      where: {
        customer_id: customerId,
        deleted_at: null,
        product: {
          deleted_at: null,
        },
      },
      include: {
        product: {
          include: {
            images: {
              where: { deleted_at: null },
              orderBy: [
                { is_primary: 'desc' },
                { created_at: 'asc' },
              ],
              take: 1,
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return items.map(
      (item) =>
        new WishlistItemEntity(
          item.id,
          item.customer_id,
          item.product_id,
          item.created_at,
          item.updated_at,
          {
            id: item.product.id,
            name: item.product.name,
            price: Number(item.product.price),
            imageUrl: item.product.images[0]?.image_url ?? null,
          },
        ),
    );
  }

  async add(
    customerId: string,
    productId: string,
  ): Promise<WishlistItemEntity> {
    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        deleted_at: null,
      },
      include: {
        images: {
          where: { deleted_at: null },
          orderBy: [
            { is_primary: 'desc' },
            { created_at: 'asc' },
          ],
          take: 1,
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const existing = await this.prisma.wishlistItem.findFirst({
      where: {
        customer_id: customerId,
        product_id: productId,
        deleted_at: null,
      },
    });

    if (existing) {
      throw new ConflictException('Product is already in the wishlist');
    }

    const deletedItem = await this.prisma.wishlistItem.findFirst({
      where: {
        customer_id: customerId,
        product_id: productId,
        deleted_at: { not: null },
      },
    });

    const item = deletedItem
      ? await this.prisma.wishlistItem.update({
          where: { id: deletedItem.id },
          data: { deleted_at: null },
        })
      : await this.prisma.wishlistItem.create({
          data: {
            customer_id: customerId,
            product_id: productId,
          },
        });

    return new WishlistItemEntity(
      item.id,
      item.customer_id,
      item.product_id,
      item.created_at,
      item.updated_at,
      {
        id: product.id,
        name: product.name,
        price: Number(product.price),
        imageUrl: product.images[0]?.image_url ?? null,
      },
    );
  }

  async remove(customerId: string, productId: string): Promise<void> {
    const item = await this.prisma.wishlistItem.findFirst({
      where: {
        customer_id: customerId,
        product_id: productId,
        deleted_at: null,
      },
    });

    if (!item) {
      throw new NotFoundException('Wishlist item not found');
    }

    await this.prisma.wishlistItem.update({
      where: { id: item.id },
      data: { deleted_at: new Date() },
    });
  }
}