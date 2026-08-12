import { Injectable, NotFoundException } from '@nestjs/common';
import { BrandRepository } from '../../domain/repositories/brand.repository';

export interface UpdateBrandInput {
  name?: string;
  description?: string;
}

@Injectable()
export class UpdateBrandUseCase {
  constructor(private readonly brandRepository: BrandRepository) {}

  async execute(id: string, input: UpdateBrandInput) {
    const existingBrand = await this.brandRepository.findById(id);

    if (!existingBrand) {
      throw new NotFoundException('Brand not found');
    }

    return this.brandRepository.update(id, input);
  }
}
