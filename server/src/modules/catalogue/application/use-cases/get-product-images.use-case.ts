import { Injectable } from '@nestjs/common';
import { ProductImageRepository } from '../../domain/repositories/product-image.repository';

@Injectable()
export class GetProductImagesUseCase {
  constructor(
    private readonly productImageRepository: ProductImageRepository,
  ) {}

  async execute(productId: string) {
    return this.productImageRepository.findAll(productId);
  }
}
