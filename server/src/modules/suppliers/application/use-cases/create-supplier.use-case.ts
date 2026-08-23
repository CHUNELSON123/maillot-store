import { BadRequestException, Injectable } from '@nestjs/common';
import { SupplierRepository } from '../../domain/repositories/supplier.repository';

export interface CreateSupplierInput {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

@Injectable()
export class CreateSupplierUseCase {
  constructor(private readonly supplierRepository: SupplierRepository) {}

  async execute(input: CreateSupplierInput) {
    const name = input.name.trim();

    if (!name) {
      throw new BadRequestException('Supplier name is required');
    }

    return this.supplierRepository.create({
      name,
      phone: input.phone?.trim(),
      email: input.email?.trim(),
      address: input.address?.trim(),
    });
  }
}
