import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductVariantRepository } from '../../domain/repositories/product-variant.repository';

@Injectable()
export class DeleteProductVariantUseCase {
  constructor(
    private readonly productVariantRepository: ProductVariantRepository,
  ) {}

  async execute(productId: string, variantId: string) {
    const existingVariant = await this.productVariantRepository.findById(
      productId,
      variantId,
    );

    if (!existingVariant) {
      throw new NotFoundException('Product variant not found');
    }

    await this.productVariantRepository.softDelete(productId, variantId);

    return {
      message: 'Product variant deleted successfully',
    };
  }
}
