import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductRepository } from '../../domain/repositories/product.repository';

export interface UpdateProductInput {
  categoryId?: string;
  brandId?: string;
  name?: string;
  description?: string;
  price?: number;
  status?: string;
}

@Injectable()
export class UpdateProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(id: string, input: UpdateProductInput) {
    const existingProduct = await this.productRepository.findById(id);

    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    return this.productRepository.update(id, input);
  }
}
