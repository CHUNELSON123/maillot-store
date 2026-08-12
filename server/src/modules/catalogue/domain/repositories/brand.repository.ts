import { BrandEntity } from '../entities/brand.entity';

export interface CreateBrandData {
  name: string;
  description?: string;
}

export interface UpdateBrandData {
  name?: string;
  description?: string;
}

export abstract class BrandRepository {
  abstract create(data: CreateBrandData): Promise<BrandEntity>;

  abstract findAll(): Promise<BrandEntity[]>;

  abstract findById(id: string): Promise<BrandEntity | null>;

  abstract update(id: string, data: UpdateBrandData): Promise<BrandEntity>;

  abstract softDelete(id: string): Promise<void>;
}
