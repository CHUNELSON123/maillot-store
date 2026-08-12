import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { CategoryEntity } from '../../domain/entities/category.entity';
import {
  CategoryRepository,
  CreateCategoryData,
  UpdateCategoryData,
} from '../../domain/repositories/category.repository';

@Injectable()
export class PrismaCategoryRepository implements CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateCategoryData): Promise<CategoryEntity> {
    const category = await this.prisma.category.create({
      data: {
        name: data.name,
        description: data.description,
      },
    });

    return new CategoryEntity(
      category.id,
      category.name,
      category.description,
      category.created_at,
      category.updated_at,
    );
  }

  async findAll(): Promise<CategoryEntity[]> {
    const categories = await this.prisma.category.findMany({
      where: {
        deleted_at: null,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return categories.map(
      (category) =>
        new CategoryEntity(
          category.id,
          category.name,
          category.description,
          category.created_at,
          category.updated_at,
        ),
    );
  }

  async findById(id: string): Promise<CategoryEntity | null> {
    const category = await this.prisma.category.findFirst({
      where: {
        id,
        deleted_at: null,
      },
    });

    if (!category) {
      return null;
    }

    return new CategoryEntity(
      category.id,
      category.name,
      category.description,
      category.created_at,
      category.updated_at,
    );
  }

  async update(id: string, data: UpdateCategoryData): Promise<CategoryEntity> {
    const category = await this.prisma.category.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
      },
    });

    return new CategoryEntity(
      category.id,
      category.name,
      category.description,
      category.created_at,
      category.updated_at,
    );
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.category.update({
      where: { id },
      data: {
        deleted_at: new Date(),
      },
    });
  }
}
