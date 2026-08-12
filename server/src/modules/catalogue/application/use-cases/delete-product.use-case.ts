import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductRepository } from '../../domain/repositories/product.repository';

@Injectable()
export class DeleteProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(id: string) {
    const existingProduct = await this.productRepository.findById(id);

    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    await this.productRepository.softDelete(id);

    return {
      message: 'Product deleted successfully',
    };
  }
}
