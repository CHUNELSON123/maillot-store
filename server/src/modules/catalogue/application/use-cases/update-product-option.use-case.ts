import { Injectable } from '@nestjs/common';
import { ProductOptionRepository, UpdateProductOptionData } from '../../domain/repositories/product-option.repository';

@Injectable()
export class UpdateProductOptionUseCase {
  constructor(private readonly repository: ProductOptionRepository) {}

  execute(id: string, data: UpdateProductOptionData) {
    return this.repository.update(id, data);
  }
}