import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import {
  CreateProductOptionData,
  ProductOptionEntity,
  ProductOptionRepository,
  ProductOptionType,
  UpdateProductOptionData,
} from '../../domain/repositories/product-option.repository';

@Injectable()
export class PrismaProductOptionRepository implements ProductOptionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(type?: ProductOptionType): Promise<ProductOptionEntity[]> {
    return this.prisma.productOption.findMany({
      where: { deleted_at: null, ...(type ? { type } : {}) },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        type: true,
        name: true,
        created_at: true,
        updated_at: true,
      },
    }) as Promise<ProductOptionEntity[]>;
  }

  async create(data: CreateProductOptionData): Promise<ProductOptionEntity> {
    const name = data.name.trim();
    if (!name) throw new ConflictException('Option name is required.');

    const existing = await this.prisma.productOption.findFirst({
      where: { type: data.type, name, deleted_at: null },
    });
    if (existing) throw new ConflictException('This option already exists.');

    const deleted = await this.prisma.productOption.findFirst({
      where: { type: data.type, name, deleted_at: { not: null } },
    });

    if (deleted) {
      return this.prisma.productOption.update({
        where: { id: deleted.id },
        data: { name, deleted_at: null },
        select: {
          id: true,
          type: true,
          name: true,
          created_at: true,
          updated_at: true,
        },
      }) as Promise<ProductOptionEntity>;
    }

    return this.prisma.productOption.create({
      data: { type: data.type, name },
      select: {
        id: true,
        type: true,
        name: true,
        created_at: true,
        updated_at: true,
      },
    }) as Promise<ProductOptionEntity>;
  }

  async update(id: string, data: UpdateProductOptionData): Promise<ProductOptionEntity> {
    const existing = await this.prisma.productOption.findFirst({
      where: { id, deleted_at: null },
    });
    if (!existing) throw new NotFoundException('Option not found.');

    const name = data.name.trim();
    if (!name) throw new ConflictException('Option name is required.');

    const duplicate = await this.prisma.productOption.findFirst({
      where: { id: { not: id }, type: existing.type, name, deleted_at: null },
    });
    if (duplicate) throw new ConflictException('This option already exists.');

    const inUse = await this.prisma.productVariant.findFirst({
      where: {
        deleted_at: null,
        ...(existing.type === 'COLOR' ? { color: existing.name } : { edition: existing.name }),
      },
      select: { id: true },
    });

    if (inUse) {
      throw new ConflictException('This option is used by a product variant. Create a new option instead of renaming it.');
    }

    return this.prisma.productOption.update({
      where: { id },
      data: { name },
      select: {
        id: true,
        type: true,
        name: true,
        created_at: true,
        updated_at: true,
      },
    }) as Promise<ProductOptionEntity>;
  }

  async softDelete(id: string): Promise<void> {
    const existing = await this.prisma.productOption.findFirst({
      where: { id, deleted_at: null },
    });
    if (!existing) throw new NotFoundException('Option not found.');

    const inUse = await this.prisma.productVariant.findFirst({
      where: {
        deleted_at: null,
        ...(existing.type === 'COLOR' ? { color: existing.name } : { edition: existing.name }),
      },
      select: { id: true },
    });

    if (inUse) {
      throw new ConflictException('This option is used by a product variant and cannot be deleted.');
    }

    await this.prisma.productOption.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }
}