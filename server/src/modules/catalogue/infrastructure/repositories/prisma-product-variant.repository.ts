import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { ProductVariantEntity } from '../../domain/entities/product-variant.entity';
import {
  CreateProductVariantData,
  ProductVariantRepository,
  UpdateProductVariantData,
} from '../../domain/repositories/product-variant.repository';

@Injectable()
export class PrismaProductVariantRepository implements ProductVariantRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(variant: {
    id: string;
    product_id: string;
    sku: string;
    size: string | null;
    color: string | null;
    edition: string | null;
    price: { toString(): string } | number | null;
    status: string;
    created_at: Date;
    updated_at: Date;
    inventory?: { quantity: number; deleted_at: Date | null } | null;
  }): ProductVariantEntity {
    return new ProductVariantEntity(
      variant.id,
      variant.product_id,
      variant.sku,
      variant.size,
      variant.color,
      variant.edition,
      variant.price === null ? null : Number(variant.price),
      variant.status,
      variant.created_at,
      variant.updated_at,
      variant.inventory && !variant.inventory.deleted_at
        ? variant.inventory.quantity
        : 0,
    );
  }

  async create(data: CreateProductVariantData): Promise<ProductVariantEntity> {
    const variant = await this.prisma.$transaction(async (tx) => {
      const created = await tx.productVariant.create({
        data: {
          product_id: data.productId,
          sku: data.sku!.trim(),
          size: data.size,
          color: data.color,
          edition: data.edition,
          price: data.price,
          status: data.status,
        },
      });

      await tx.inventory.create({
        data: { variant_id: created.id, quantity: 0, min_stock: 0 },
      });

      return created;
    });

    return this.toEntity(variant);
  }

  async findAll(productId: string): Promise<ProductVariantEntity[]> {
    const variants = await this.prisma.productVariant.findMany({
      where: {
        product_id: productId,
        deleted_at: null,
      },
      include: {
        inventory: {
          select: { quantity: true, deleted_at: true },
        },
      },
      orderBy: {
        sku: 'asc',
      },
    });

    return variants.map((variant) => this.toEntity(variant));
  }

  async findById(
    productId: string,
    variantId: string,
  ): Promise<ProductVariantEntity | null> {
    const variant = await this.prisma.productVariant.findFirst({
      where: {
        id: variantId,
        product_id: productId,
        deleted_at: null,
      },
      include: {
        inventory: {
          select: { quantity: true, deleted_at: true },
        },
      },
    });

    return variant ? this.toEntity(variant) : null;
  }

  async update(
    productId: string,
    variantId: string,
    data: UpdateProductVariantData,
  ): Promise<ProductVariantEntity> {
    const variant = await this.prisma.productVariant.update({
      where: {
        id: variantId,
        product_id: productId,
      },
      data: {
        ...(data.sku !== undefined && { sku: data.sku.trim() }),
        ...(data.size !== undefined && { size: data.size }),
        ...(data.color !== undefined && { color: data.color }),
        ...(data.edition !== undefined && { edition: data.edition }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.status !== undefined && { status: data.status }),
      },
      include: {
        inventory: {
          select: { quantity: true, deleted_at: true },
        },
      },
    });

    return this.toEntity(variant);
  }

  async softDelete(productId: string, variantId: string): Promise<void> {
    await this.prisma.productVariant.update({
      where: {
        id: variantId,
        product_id: productId,
      },
      data: {
        deleted_at: new Date(),
      },
    });
  }
}

