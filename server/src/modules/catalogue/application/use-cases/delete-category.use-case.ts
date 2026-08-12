import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoryRepository } from '../../domain/repositories/category.repository';

@Injectable()
export class DeleteCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(id: string) {
    const existingCategory = await this.categoryRepository.findById(id);

    if (!existingCategory) {
      throw new NotFoundException('Category not found');
    }

    await this.categoryRepository.softDelete(id);

    return {
      message: 'Category deleted successfully',
    };
  }
}
