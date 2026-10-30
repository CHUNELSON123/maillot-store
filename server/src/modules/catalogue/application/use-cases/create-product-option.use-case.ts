import { Injectable } from '@nestjs/common';
import { ProductOptionRepository, CreateProductOptionData } from '../../domain/repositories/product-option.repository';

@Injectable()
export class CreateProductOptionUseCase {
  constructor(private readonly repository: ProductOptionRepository) {}

  execute(data: CreateProductOptionData) {
    return this.repository.create(data);
  }
}