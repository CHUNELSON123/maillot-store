import { PurchaseEntity } from '../entities/purchase.entity';

export interface CreatePurchaseItemData {
  variantId: string;
  quantity: number;
  unitCost: number;
}

export interface CreatePurchaseData {
  supplierId: string;
  purchaseNumber: string;
  purchaseDate?: Date;
  status: string;
  items: CreatePurchaseItemData[];
}

export interface UpdatePurchaseStatusData {
  status: string;
}

export abstract class PurchaseRepository {
  abstract create(data: CreatePurchaseData): Promise<PurchaseEntity>;

  abstract findById(purchaseId: string): Promise<PurchaseEntity | null>;

  abstract findAll(): Promise<PurchaseEntity[]>;

  abstract updateStatus(
    purchaseId: string,
    data: UpdatePurchaseStatusData,
  ): Promise<PurchaseEntity>;
}
