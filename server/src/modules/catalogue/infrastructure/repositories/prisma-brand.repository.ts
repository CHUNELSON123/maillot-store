import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { BrandEntity } from '../../domain/entities/brand.entity';
import {
  BrandRepository,
  CreateBrandData,
  UpdateBrandData,
} from '../../domain/repositories/brand.repository';

@Injectable()
export class PrismaBrandRepository implements BrandRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateBrandData): Promise<BrandEntity> {
    const brand = await this.prisma.brand.create({
      data: {
        name: data.name,
        description: data.description,
      },
    });

    return new BrandEntity(
      brand.id,
      brand.name,
      brand.description,
      brand.created_at,
      brand.updated_at,
    );
  }

  async findAll(): Promise<BrandEntity[]> {
    const brands = await this.prisma.brand.findMany({
      where: {
        deleted_at: null,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return brands.map(
      (brand) =>
        new BrandEntity(
          brand.id,
          brand.name,
          brand.description,
          brand.created_at,
          brand.updated_at,
        ),
    );
  }

  async findById(id: string): Promise<BrandEntity | null> {
    const brand = await this.prisma.brand.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });

    if (!brand) {
      return null;
    }

    return new BrandEntity(
      brand.id,
      brand.name,
      brand.description,
      brand.created_at,
      brand.updated_at,
    );
  }

  async update(id: string, data: UpdateBrandData): Promise<BrandEntity> {
    const brand = await this.prisma.brand.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
      },
    });

    return new BrandEntity(
      brand.id,
      brand.name,
      brand.description,
      brand.created_at,
      brand.updated_at,
    );
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.brand.update({
      where: { id },
      data: {
        deleted_at: new Date(),
      },
    });
  }
}
