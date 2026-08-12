import { Injectable } from '@nestjs/common';
import { ProductRepository } from '../../domain/repositories/product.repository';

export interface CreateProductInput {
  categoryId: string;
  brandId: string;
  name: string;
  description?: string;
  price: number;
  status: string;
}

@Injectable()
export class CreateProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(input: CreateProductInput) {
    return this.productRepository.create(input);
  }
}
