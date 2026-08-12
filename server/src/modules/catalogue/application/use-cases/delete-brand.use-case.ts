import { Injectable, NotFoundException } from '@nestjs/common';
import { BrandRepository } from '../../domain/repositories/brand.repository';

@Injectable()
export class DeleteBrandUseCase {
  constructor(private readonly brandRepository: BrandRepository) {}

  async execute(id: string) {
    const existingBrand = await this.brandRepository.findById(id);

    if (!existingBrand) {
      throw new NotFoundException('Brand not found');
    }

    await this.brandRepository.softDelete(id);

    return {
      message: 'Brand deleted successfully',
    };
  }
}
