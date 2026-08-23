import { Injectable, NotFoundException } from '@nestjs/common';
import { SupplierRepository } from '../../domain/repositories/supplier.repository';

@Injectable()
export class GetSupplierUseCase {
  constructor(private readonly supplierRepository: SupplierRepository) {}

  async execute(supplierId: string) {
    const supplier = await this.supplierRepository.findById(supplierId);

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    return supplier;
  }
}
