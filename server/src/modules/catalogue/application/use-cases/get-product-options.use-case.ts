import { Injectable } from '@nestjs/common';
import {
  ProductOptionRepository,
  ProductOptionType,
} from '../../domain/repositories/product-option.repository';

@Injectable()
export class GetProductOptionsUseCase {
  constructor(private readonly repository: ProductOptionRepository) {}

  execute(type?: ProductOptionType) {
    return this.repository.findAll(type);
  }
}