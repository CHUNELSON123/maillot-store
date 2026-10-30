import { Injectable } from '@nestjs/common';
import { ProductOptionRepository } from '../../domain/repositories/product-option.repository';

@Injectable()
export class DeleteProductOptionUseCase {
  constructor(private readonly repository: ProductOptionRepository) {}

  execute(id: string) {
    return this.repository.softDelete(id);
  }
}