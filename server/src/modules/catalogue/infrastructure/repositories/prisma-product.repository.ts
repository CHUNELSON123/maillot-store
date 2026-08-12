import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { ProductEntity } from '../../domain/entities/product.entity';
import {
  CreateProductData,
  ProductRepository,
  UpdateProductData,
} from '../../domain/repositories/product.repository';

@Injectable()
export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateProductData): Promise<ProductEntity> {
    const product = await this.prisma.product.create({
      data: {
        category_id: data.categoryId,
        brand_id: data.brandId,
        name: data.name,
        description: data.description,
        price: data.price,
        status: data.status,
      },
    });

    return new ProductEntity(
      product.id,
      product.category_id,
      product.brand_id,
      product.name,
      product.description,
      Number(product.price),
      product.status,
      product.created_at,
      product.updated_at,
    );
  }

  async findAll(): Promise<ProductEntity[]> {
    const products = await this.prisma.product.findMany({
      where: {
        deleted_at: null,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return products.map(
      (product) =>
        new ProductEntity(
          product.id,
          product.category_id,
          product.brand_id,
          product.name,
          product.description,
          Number(product.price),
          product.status,
          product.created_at,
          product.updated_at,
        ),
    );
  }

  async findById(id: string): Promise<ProductEntity | null> {
    const product = await this.prisma.product.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });

    if (!product) {
      return null;
    }

    return new ProductEntity(
      product.id,
      product.category_id,
      product.brand_id,
      product.name,
      product.description,
      Number(product.price),
      product.status,
      product.created_at,
      product.updated_at,
    );
  }

  async update(id: string, data: UpdateProductData): Promise<ProductEntity> {
    const product = await this.prisma.product.update({
      where: { id },
      data: {
        ...(data.categoryId !== undefined && {
          category_id: data.categoryId,
        }),
        ...(data.brandId !== undefined && {
          brand_id: data.brandId,
        }),
        ...(data.name !== undefined && {
          name: data.name,
        }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.price !== undefined && {
          price: data.price,
        }),
        ...(data.status !== undefined && {
          status: data.status,
        }),
      },
    });

    return new ProductEntity(
      product.id,
      product.category_id,
      product.brand_id,
      product.name,
      product.description,
      Number(product.price),
      product.status,
      product.created_at,
      product.updated_at,
    );
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.product.update({
      where: { id },
      data: {
        deleted_at: new Date(),
      },
    });
  }
}
