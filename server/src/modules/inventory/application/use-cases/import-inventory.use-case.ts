import { BadRequestException, Injectable } from '@nestjs/common';
import { InventoryMovementRepository } from '../../domain/repositories/inventory-movement.repository';

@Injectable()
export class ImportInventoryUseCase {
  constructor(private readonly movements: InventoryMovementRepository) {}

  execute(rows: { sku: string; quantity: number; minStock?: number }[]) {
    const normalized = rows.map((row) => ({ ...row, sku: row.sku.trim() }));
    const seen = new Set<string>();
    for (const row of normalized) {
      const key = row.sku.toUpperCase();
      if (seen.has(key)) throw new BadRequestException(`Duplicate SKU in import: ${row.sku}`);
      seen.add(key);
    }
    return this.movements.importBySku(normalized);
  }
}
