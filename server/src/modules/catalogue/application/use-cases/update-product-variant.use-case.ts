import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductVariantRepository } from '../../domain/repositories/product-variant.repository';

export interface UpdateProductVariantInput {
  sku?: string;
  size?: string;
  color?: string;
  edition?: string;
  price?: number;
  status?: string;
}

@Injectable()
export class UpdateProductVariantUseCase {
  constructor(
    private readonly productVariantRepository: ProductVariantRepository,
  ) {}

  async execute(
    productId: string,
    variantId: string,
    input: UpdateProductVariantInput,
  ) {
    const existingVariant = await this.productVariantRepository.findById(
      productId,
      variantId,
    );

    if (!existingVariant) {
      throw new NotFoundException('Product variant not found');
    }

    return this.productVariantRepository.update(productId, variantId, input);
  }
}
