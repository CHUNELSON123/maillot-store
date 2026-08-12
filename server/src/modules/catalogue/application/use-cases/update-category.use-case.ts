import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoryRepository } from '../../domain/repositories/category.repository';

export interface UpdateCategoryInput {
  name?: string;
  description?: string;
}

@Injectable()
export class UpdateCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(id: string, input: UpdateCategoryInput) {
    const existingCategory = await this.categoryRepository.findById(id);

    if (!existingCategory) {
      throw new NotFoundException('Category not found');
    }

    return this.categoryRepository.update(id, input);
  }
}
