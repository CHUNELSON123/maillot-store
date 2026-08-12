import { Injectable, NotFoundException } from '@nestjs/common';
import { BrandRepository } from '../../domain/repositories/brand.repository';

@Injectable()
export class GetBrandUseCase {
  constructor(private readonly brandRepository: BrandRepository) {}

  async execute(id: string) {
    const brand = await this.brandRepository.findById(id);

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    return brand;
  }
}
