import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { ProductImageEntity } from '../../domain/entities/product-image.entity';
import {
  AddProductImageData,
  ProductImageRepository,
} from '../../domain/repositories/product-image.repository';

@Injectable()
export class PrismaProductImageRepository implements ProductImageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: AddProductImageData): Promise<ProductImageEntity> {
    const image = await this.prisma.productImage.create({
      data: {
        product_id: data.productId,
        image_url: data.imageUrl,
        alt_text: data.altText,
        is_primary: data.isPrimary ?? false,
      },
    });

    return new ProductImageEntity(
      image.id,
      image.product_id,
      image.image_url,
      image.alt_text,
      image.is_primary,
      image.created_at,
      image.updated_at,
    );
  }

  async findAll(productId: string): Promise<ProductImageEntity[]> {
    const images = await this.prisma.productImage.findMany({
      where: {
        product_id: productId,
        deleted_at: null,
      },
      orderBy: [{ is_primary: 'desc' }, { created_at: 'asc' }],
    });

    return images.map(
      (image) =>
        new ProductImageEntity(
          image.id,
          image.product_id,
          image.image_url,
          image.alt_text,
          image.is_primary,
          image.created_at,
          image.updated_at,
        ),
    );
  }

  async findById(
    productId: string,
    imageId: string,
  ): Promise<ProductImageEntity | null> {
    const image = await this.prisma.productImage.findFirst({
      where: {
        id: imageId,
        product_id: productId,
        deleted_at: null,
      },
    });

    if (!image) {
      return null;
    }

    return new ProductImageEntity(
      image.id,
      image.product_id,
      image.image_url,
      image.alt_text,
      image.is_primary,
      image.created_at,
      image.updated_at,
    );
  }

  async softDelete(productId: string, imageId: string): Promise<void> {
    await this.prisma.productImage.update({
      where: {
        id: imageId,
        product_id: productId,
      },
      data: {
        deleted_at: new Date(),
      },
    });
  }
}
