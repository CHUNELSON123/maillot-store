import { Injectable } from '@nestjs/common';
import { SupplierRepository } from '../../domain/repositories/supplier.repository';

@Injectable()
export class GetSuppliersUseCase {
  constructor(private readonly supplierRepository: SupplierRepository) {}

  async execute() {
    return this.supplierRepository.findAll();
  }
}
