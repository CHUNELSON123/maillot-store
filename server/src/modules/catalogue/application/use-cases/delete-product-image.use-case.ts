import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductImageRepository } from '../../domain/repositories/product-image.repository';

@Injectable()
export class DeleteProductImageUseCase {
  constructor(
    private readonly productImageRepository: ProductImageRepository,
  ) {}

  async execute(productId: string, imageId: string) {
    const image = await this.productImageRepository.findById(
      productId,
      imageId,
    );

    if (!image) {
      throw new NotFoundException('Product image not found');
    }

    await this.productImageRepository.softDelete(productId, imageId);

    return {
      message: 'Product image deleted successfully',
    };
  }
}
