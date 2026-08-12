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

  async create(data: CreateProductVariantData): Promise<ProductVariantEntity> {
    const variant = await this.prisma.productVariant.create({
      data: {
        product_id: data.productId,
        sku: data.sku,
        size: data.size,
        color: data.color,
        edition: data.edition,
        price: data.price,
        status: data.status,
      },
    });

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
    );
  }

  async findAll(productId: string): Promise<ProductVariantEntity[]> {
    const variants = await this.prisma.productVariant.findMany({
      where: {
        product_id: productId,
        deleted_at: null,
      },
      orderBy: {
        sku: 'asc',
      },
    });

    return variants.map(
      (variant) =>
        new ProductVariantEntity(
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
        ),
    );
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
    });

    if (!variant) {
      return null;
    }

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
    );
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
        ...(data.sku !== undefined && {
          sku: data.sku,
        }),
        ...(data.size !== undefined && {
          size: data.size,
        }),
        ...(data.color !== undefined && {
          color: data.color,
        }),
        ...(data.edition !== undefined && {
          edition: data.edition,
        }),
        ...(data.price !== undefined && {
          price: data.price,
        }),
        ...(data.status !== undefined && {
          status: data.status,
        }),
      },
    });

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
    );
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
