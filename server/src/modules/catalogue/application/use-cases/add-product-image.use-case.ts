import { Injectable } from '@nestjs/common';
import { ProductImageRepository } from '../../domain/repositories/product-image.repository';

export interface AddProductImageInput {
  productId: string;
  imageUrl: string;
  altText?: string;
  isPrimary?: boolean;
}

@Injectable()
export class AddProductImageUseCase {
  constructor(
    private readonly productImageRepository: ProductImageRepository,
  ) {}

  async execute(input: AddProductImageInput) {
    return this.productImageRepository.create(input);
  }
}
