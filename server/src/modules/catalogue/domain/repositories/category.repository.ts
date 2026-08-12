import { CategoryEntity } from '../entities/category.entity';

export interface CreateCategoryData {
  name: string;
  description?: string;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
}

export abstract class CategoryRepository {
  abstract create(data: CreateCategoryData): Promise<CategoryEntity>;

  abstract findAll(): Promise<CategoryEntity[]>;

  abstract findById(id: string): Promise<CategoryEntity | null>;

  abstract update(
    id: string,
    data: UpdateCategoryData,
  ): Promise<CategoryEntity>;

  abstract softDelete(id: string): Promise<void>;
}
