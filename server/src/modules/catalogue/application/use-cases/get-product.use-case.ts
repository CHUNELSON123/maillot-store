import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductRepository } from '../../domain/repositories/product.repository';

@Injectable()
export class GetProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(id: string) {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }
}
