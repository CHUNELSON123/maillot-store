import { Injectable } from '@nestjs/common';
import { ProductVariantRepository } from '../../domain/repositories/product-variant.repository';

@Injectable()
export class GetProductVariantsUseCase {
  constructor(
    private readonly productVariantRepository: ProductVariantRepository,
  ) {}

  async execute(productId: string) {
    return this.productVariantRepository.findAll(productId);
  }
}
