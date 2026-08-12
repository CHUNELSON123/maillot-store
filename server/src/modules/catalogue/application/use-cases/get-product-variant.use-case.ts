import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductVariantRepository } from '../../domain/repositories/product-variant.repository';

@Injectable()
export class GetProductVariantUseCase {
  constructor(
    private readonly productVariantRepository: ProductVariantRepository,
  ) {}

  async execute(productId: string, variantId: string) {
    const variant = await this.productVariantRepository.findById(
      productId,
      variantId,
    );

    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }

    return variant;
  }
}
