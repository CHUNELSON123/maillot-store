import { Injectable } from '@nestjs/common';
import { CategoryRepository } from '../../domain/repositories/category.repository';

export interface CreateCategoryInput {
  name: string;
  description?: string;
  imageUrl?: string;
}

@Injectable()
export class CreateCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(input: CreateCategoryInput) {
    return this.categoryRepository.create({
      name: input.name,
      description: input.description,
      imageUrl: input.imageUrl,
    });
  }
}
