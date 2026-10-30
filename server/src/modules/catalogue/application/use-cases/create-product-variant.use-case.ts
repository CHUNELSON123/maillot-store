import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ProductVariantRepository } from '../../domain/repositories/product-variant.repository';

export interface CreateProductVariantInput {
  productId: string;
  sku?: string;
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
    const sku = input.sku?.trim() || `MLS-${randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`;
    return this.productVariantRepository.create({ ...input, sku });
  }
}
