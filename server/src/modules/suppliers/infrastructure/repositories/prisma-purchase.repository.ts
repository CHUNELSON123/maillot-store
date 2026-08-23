import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { PurchaseEntity } from '../../domain/entities/purchase.entity';
import { PurchaseItemEntity } from '../../domain/entities/purchase-item.entity';
import {
  CreatePurchaseData,
  PurchaseRepository,
  UpdatePurchaseStatusData,
} from '../../domain/repositories/purchase.repository';

@Injectable()
export class PrismaPurchaseRepository implements PurchaseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreatePurchaseData): Promise<PurchaseEntity> {
    if (data.items.length === 0) {
      throw new ConflictException('Purchase must contain at least one item');
    }

    const supplier = await this.prisma.supplier.findFirst({
      where: {
        id: data.supplierId,
        deleted_at: null,
      },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    const existingPurchase = await this.prisma.purchase.findFirst({
      where: {
        purchase_number: data.purchaseNumber,
      },
    });

    if (existingPurchase) {
      throw new ConflictException('Purchase number already exists');
    }

    const variantIds = data.items.map((item) => item.variantId);

    const variants = await this.prisma.productVariant.findMany({
      where: {
        id: {
          in: variantIds,
        },
        deleted_at: null,
      },
      select: {
        id: true,
      },
    });

    const existingVariantIds = new Set(variants.map((variant) => variant.id));

    for (const item of data.items) {
      if (!existingVariantIds.has(item.variantId)) {
        throw new NotFoundException(
          `Product variant not found: ${item.variantId}`,
        );
      }

      if (item.quantity <= 0) {
        throw new ConflictException(
          'Purchase quantity must be greater than zero',
        );
      }

      if (item.unitCost < 0) {
        throw new ConflictException('Purchase unit cost cannot be negative');
      }
    }

    const totalAmount = data.items.reduce(
      (total, item) => total + item.quantity * item.unitCost,
      0,
    );

    const purchase = await this.prisma.purchase.create({
      data: {
        supplier_id: data.supplierId,
        purchase_number: data.purchaseNumber,
        purchase_date: data.purchaseDate ?? new Date(),
        total_amount: totalAmount,
        status: data.status,
        items: {
          create: data.items.map((item) => ({
            variant_id: item.variantId,
            quantity: item.quantity,
            unit_cost: item.unitCost,
          })),
        },
      },
      include: {
        items: {
          where: {
            deleted_at: null,
          },
        },
      },
    });

    return this.toEntity(purchase);
  }

  async findById(purchaseId: string): Promise<PurchaseEntity | null> {
    const purchase = await this.prisma.purchase.findFirst({
      where: {
        id: purchaseId,
        deleted_at: null,
      },
      include: {
        items: {
          where: {
            deleted_at: null,
          },
        },
      },
    });

    if (!purchase) {
      return null;
    }

    return this.toEntity(purchase);
  }

  async findAll(): Promise<PurchaseEntity[]> {
    const purchases = await this.prisma.purchase.findMany({
      where: {
        deleted_at: null,
      },
      include: {
        items: {
          where: {
            deleted_at: null,
          },
        },
      },
      orderBy: {
        purchase_date: 'desc',
      },
    });

    return purchases.map((purchase) => this.toEntity(purchase));
  }

  async updateStatus(
    purchaseId: string,
    data: UpdatePurchaseStatusData,
  ): Promise<PurchaseEntity> {
    return this.prisma.$transaction(async (tx) => {
      const existingPurchase = await tx.purchase.findFirst({
        where: {
          id: purchaseId,
          deleted_at: null,
        },
        include: {
          items: {
            where: {
              deleted_at: null,
            },
          },
        },
      });

      if (!existingPurchase) {
        throw new NotFoundException('Purchase not found');
      }

      const status = data.status.toUpperCase();

      const allowedStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED'];

      if (!allowedStatuses.includes(status)) {
        throw new ConflictException('Invalid purchase status');
      }

      if (existingPurchase.status === 'CONFIRMED' && status !== 'CONFIRMED') {
        throw new ConflictException(
          'A confirmed purchase cannot change status',
        );
      }

      if (existingPurchase.status === 'CANCELLED' && status !== 'CANCELLED') {
        throw new ConflictException(
          'A cancelled purchase cannot change status',
        );
      }

      const shouldAddInventory =
        existingPurchase.status === 'PENDING' && status === 'CONFIRMED';

      if (shouldAddInventory) {
        for (const item of existingPurchase.items) {
          const inventory = await tx.inventory.findFirst({
            where: {
              variant_id: item.variant_id,
              deleted_at: null,
            },
          });

          if (!inventory) {
            throw new NotFoundException(
              `Inventory not found for variant ${item.variant_id}`,
            );
          }

          await tx.inventory.update({
            where: {
              variant_id: item.variant_id,
            },
            data: {
              quantity: {
                increment: item.quantity,
              },
            },
          });

          await tx.inventoryMovement.create({
            data: {
              variant_id: item.variant_id,
              quantity: item.quantity,
              movement_type: 'STOCK_IN',
              reference: `Purchase ${existingPurchase.purchase_number}`,
            },
          });
        }
      }

      const purchase = await tx.purchase.update({
        where: {
          id: purchaseId,
        },
        data: {
          status,
        },
        include: {
          items: {
            where: {
              deleted_at: null,
            },
          },
        },
      });

      return this.toEntity(purchase);
    });
  }

  private toEntity(purchase: {
    id: string;
    supplier_id: string;
    purchase_number: string;
    purchase_date: Date;
    total_amount: unknown;
    status: string;
    created_at: Date;
    updated_at: Date;
    items: Array<{
      id: string;
      purchase_id: string;
      variant_id: string;
      quantity: number;
      unit_cost: unknown;
      created_at: Date;
      updated_at: Date;
    }>;
  }): PurchaseEntity {
    const items = purchase.items.map(
      (item) =>
        new PurchaseItemEntity(
          item.id,
          item.purchase_id,
          item.variant_id,
          item.quantity,
          Number(item.unit_cost),
          item.created_at,
          item.updated_at,
        ),
    );

    return new PurchaseEntity(
      purchase.id,
      purchase.supplier_id,
      purchase.purchase_number,
      purchase.purchase_date,
      Number(purchase.total_amount),
      purchase.status,
      items,
      purchase.created_at,
      purchase.updated_at,
    );
  }
}
