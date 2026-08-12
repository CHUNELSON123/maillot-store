import { Injectable } from '@nestjs/common';
import { ProductRepository } from '../../domain/repositories/product.repository';

@Injectable()
export class GetProductsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute() {
    return this.productRepository.findAll();
  }
}
