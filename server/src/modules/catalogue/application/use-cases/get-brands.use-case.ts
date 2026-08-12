import { Injectable } from '@nestjs/common';
import { BrandRepository } from '../../domain/repositories/brand.repository';

@Injectable()
export class GetBrandsUseCase {
  constructor(private readonly brandRepository: BrandRepository) {}

  async execute() {
    return this.brandRepository.findAll();
  }
}
