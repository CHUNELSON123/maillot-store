
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { ProductEntity } from '../../domain/entities/product.entity';
import {
  CreateProductData,
  ProductListQuery,
  ProductRepository,
  UpdateProductData,
} from '../../domain/repositories/product.repository';

function storefrontEdition(variants: Array<{ edition: string | null }>, productEdition: string | null) {
  const isEditionLabel = (value: string | null) => {
    if (!value?.trim()) return false;
    return !/^(active|inactive|pending|draft|\d+)$/i.test(value.trim());
  };
  const variantEdition = variants.find((variant) => isEditionLabel(variant.edition))?.edition;
  return isEditionLabel(productEdition) ? productEdition : variantEdition ?? null;
}

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
        season: data.season,
        edition: data.edition,
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
      product.season,
      product.edition,
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
        status: {
          equals: 'ACTIVE',
          mode: 'insensitive',
        },
      },
      orderBy: {
        name: 'asc',
      },
      include: {
        variants: { where: { deleted_at: null }, select: { edition: true }, orderBy: { created_at: 'asc' } },
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
          product.season,
          storefrontEdition(product.variants, product.edition),
          Number(product.price),
          product.status,
          product.created_at,
          product.updated_at,
        ),
    );
  }

  async findPage(query: ProductListQuery) {
    const where = {
      deleted_at: null,
      ...(query.categoryId ? { category_id: query.categoryId } : {}),
      ...(query.brandId ? { brand_id: query.brandId } : {}),
      ...(query.status
        ? {
            status: {
              equals: query.status,
              mode: 'insensitive' as const,
            },
          }
        : {}),
      ...(query.search
        ? {
            OR: [
              {
                name: {
                  contains: query.search,
                  mode: 'insensitive' as const,
                },
              },
              {
                description: {
                  contains: query.search,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
    };

    const orderBy =
      query.sort === 'price-asc'
        ? { price: 'asc' as const }
        : query.sort === 'price-desc'
          ? { price: 'desc' as const }
          : query.sort === 'name'
            ? { name: 'asc' as const }
            : { created_at: 'desc' as const };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        include: {
          variants: { where: { deleted_at: null }, select: { edition: true }, orderBy: { created_at: 'asc' } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items: products.map(
        (product) =>
          new ProductEntity(
            product.id,
            product.category_id,
            product.brand_id,
            product.name,
            product.description,
            product.season,
            storefrontEdition(product.variants, product.edition),
            Number(product.price),
            product.status,
            product.created_at,
            product.updated_at,
          ),
      ),
      total,
    };
  }

  async findById(id: string): Promise<ProductEntity | null> {
    const product = await this.prisma.product.findFirst({
      where: {
        id,
        deleted_at: null,
      },
      include: {
        variants: { where: { deleted_at: null }, select: { edition: true }, orderBy: { created_at: 'asc' } },
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
      product.season,
      storefrontEdition(product.variants, product.edition),
      Number(product.price),
      product.status,
      product.created_at,
      product.updated_at,
    );
  }

  async update(id: string, data: UpdateProductData): Promise<ProductEntity> {
    const product = await this.prisma.$transaction(async (tx) => {
      const previous = await tx.product.findUniqueOrThrow({ where: { id }, select: { price: true } });
      const updated = await tx.product.update({
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
        ...(data.season !== undefined && { season: data.season }),
        ...(data.edition !== undefined && { edition: data.edition }),
        ...(data.price !== undefined && {
          price: data.price,
        }),
        ...(data.status !== undefined && {
          status: data.status,
        }),
      },
      });
      if (data.price !== undefined) {
        // Variants using the old base price follow the new base price; custom prices stay intact.
        await tx.productVariant.updateMany({
          where: { product_id: id, deleted_at: null, price: previous.price },
          data: { price: data.price },
        });
      }
      return updated;
    });

    return new ProductEntity(
      product.id,
      product.category_id,
      product.brand_id,
      product.name,
      product.description,
      product.season,
      product.edition,
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
