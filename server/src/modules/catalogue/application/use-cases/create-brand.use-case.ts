import { Injectable } from '@nestjs/common';
import { BrandRepository } from '../../domain/repositories/brand.repository';

export interface CreateBrandInput {
  name: string;
  description?: string;
}

@Injectable()
export class CreateBrandUseCase {
  constructor(private readonly brandRepository: BrandRepository) {}

  async execute(input: CreateBrandInput) {
    return this.brandRepository.create({
      name: input.name,
      description: input.description,
    });
  }
}
