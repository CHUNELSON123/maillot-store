import { BadRequestException, Injectable } from '@nestjs/common';
import { SupplierRepository } from '../../domain/repositories/supplier.repository';

export interface UpdateSupplierInput {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
}

@Injectable()
export class UpdateSupplierUseCase {
  constructor(private readonly supplierRepository: SupplierRepository) {}

  async execute(supplierId: string, input: UpdateSupplierInput) {
    if (input.name !== undefined && !input.name.trim()) {
      throw new BadRequestException('Supplier name cannot be empty');
    }

    return this.supplierRepository.update(supplierId, {
      ...(input.name !== undefined && {
        name: input.name.trim(),
      }),
      ...(input.phone !== undefined && {
        phone: input.phone.trim(),
      }),
      ...(input.email !== undefined && {
        email: input.email.trim(),
      }),
      ...(input.address !== undefined && {
        address: input.address.trim(),
      }),
    });
  }
}
