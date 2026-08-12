import { Injectable } from '@nestjs/common';
import { ProductVariantRepository } from '../../domain/repositories/product-variant.repository';

export interface CreateProductVariantInput {
  productId: string;
  sku: string;
  size?: string;
  color?: string;
  edition?: string;
  price?: number;
  status: string;
}

@Injectable()
export class CreateProductVariantUseCase {
  constructor(
    private readonly productVariantRepository: ProductVariantRepository,
  ) {}

  async execute(input: CreateProductVariantInput) {
    return this.productVariantRepository.create(input);
  }
}
