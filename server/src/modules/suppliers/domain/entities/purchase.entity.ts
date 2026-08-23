import { PurchaseItemEntity } from './purchase-item.entity';

export class PurchaseEntity {
  constructor(
    public readonly id: string,
    public readonly supplierId: string,
    public readonly purchaseNumber: string,
    public readonly purchaseDate: Date,
    public readonly totalAmount: number,
    public readonly status: string,
    public readonly items: PurchaseItemEntity[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
