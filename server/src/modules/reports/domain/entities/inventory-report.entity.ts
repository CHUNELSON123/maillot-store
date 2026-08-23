export class InventoryReportEntity {
  constructor(
    public readonly totalVariants: number,
    public readonly totalQuantity: number,
    public readonly lowStockCount: number,
    public readonly outOfStockCount: number,
  ) {}
}
