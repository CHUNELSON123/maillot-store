import { SupplierEntity } from '../entities/supplier.entity';

export interface CreateSupplierData {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface UpdateSupplierData {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export abstract class SupplierRepository {
  abstract create(data: CreateSupplierData): Promise<SupplierEntity>;

  abstract findById(supplierId: string): Promise<SupplierEntity | null>;

  abstract findAll(): Promise<SupplierEntity[]>;

  abstract update(
    supplierId: string,
    data: UpdateSupplierData,
  ): Promise<SupplierEntity>;
}
