import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoryRepository } from '../../domain/repositories/category.repository';

@Injectable()
export class GetCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(id: string) {
    const category = await this.categoryRepository.findById(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }
}
