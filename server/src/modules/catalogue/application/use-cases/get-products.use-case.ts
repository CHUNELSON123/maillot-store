import { Injectable } from '@nestjs/common';
import {
  ProductListQuery,
  ProductRepository,
} from '../../domain/repositories/product.repository';

@Injectable()
export class GetProductsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute() {
    return this.productRepository.findAll();
  }

  async executePage(query: ProductListQuery) {
    const result = await this.productRepository.findPage(query);
    return {
      items: result.items,
      page: query.page,
      limit: query.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / query.limit),
    };
  }
}
