import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../infrastructure/database/prisma.service';

import {
  ReportFilter,
  ReportsRepository,
} from '../../domain/repositories/reports.repository';

import { SalesReportEntity } from '../../domain/entities/sales-report.entity';
import { InventoryReportEntity } from '../../domain/entities/inventory-report.entity';
import { CommissionReportEntity } from '../../domain/entities/commission-report.entity';
import { CustomerReportEntity } from '../../domain/entities/customer-report.entity';
import { DashboardSummaryEntity } from '../../domain/entities/dashboard-summary.entity';

@Injectable()
export class PrismaReportsRepository implements ReportsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getSalesReport(filter?: ReportFilter): Promise<SalesReportEntity> {
    const where = {
      deleted_at: null,
      ...(filter?.startDate || filter?.endDate
        ? {
            created_at: {
              ...(filter.startDate ? { gte: filter.startDate } : {}),
              ...(filter.endDate ? { lte: filter.endDate } : {}),
            },
          }
        : {}),
    };

    const [totalOrders, confirmedOrders, cancelledOrders, sales] =
      await Promise.all([
        this.prisma.order.count({ where }),

        this.prisma.order.count({
          where: {
            ...where,
            status: 'CONFIRMED',
          },
        }),

        this.prisma.order.count({
          where: {
            ...where,
            status: 'CANCELLED',
          },
        }),

        this.prisma.order.aggregate({
          where: {
            ...where,
            status: 'CONFIRMED',
          },
          _sum: {
            total_amount: true,
          },
        }),
      ]);

    return new SalesReportEntity(
      totalOrders,
      confirmedOrders,
      cancelledOrders,
      Number(sales._sum.total_amount ?? 0),
      filter?.startDate ?? null,
      filter?.endDate ?? null,
    );
  }

  async getInventoryReport(): Promise<InventoryReportEntity> {
    const inventories = await this.prisma.inventory.findMany({
      where: {
        deleted_at: null,
      },
      select: {
        quantity: true,
        min_stock: true,
      },
    });

    const totalVariants = inventories.length;

    const totalQuantity = inventories.reduce(
      (total, item) => total + item.quantity,
      0,
    );

    const lowStockCount = inventories.filter(
      (item) => item.quantity > 0 && item.quantity <= item.min_stock,
    ).length;

    const outOfStockCount = inventories.filter(
      (item) => item.quantity <= 0,
    ).length;

    return new InventoryReportEntity(
      totalVariants,
      totalQuantity,
      lowStockCount,
      outOfStockCount,
    );
  }

  async getCommissionReport(
    filter?: ReportFilter,
  ): Promise<CommissionReportEntity> {
    const where = {
      deleted_at: null,
      ...(filter?.startDate || filter?.endDate
        ? {
            created_at: {
              ...(filter.startDate ? { gte: filter.startDate } : {}),
              ...(filter.endDate ? { lte: filter.endDate } : {}),
            },
          }
        : {}),
    };

    const [total, pending, approved, paid] = await Promise.all([
      this.prisma.commission.aggregate({
        where,
        _sum: {
          amount: true,
        },
      }),

      this.prisma.commission.aggregate({
        where: {
          ...where,
          status: 'PENDING',
        },
        _sum: {
          amount: true,
        },
      }),

      this.prisma.commission.aggregate({
        where: {
          ...where,
          status: 'APPROVED',
        },
        _sum: {
          amount: true,
        },
      }),

      this.prisma.commission.aggregate({
        where: {
          ...where,
          status: 'PAID',
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    return new CommissionReportEntity(
      Number(total._sum.amount ?? 0),
      Number(pending._sum.amount ?? 0),
      Number(approved._sum.amount ?? 0),
      Number(paid._sum.amount ?? 0),
    );
  }

  async getCustomerReport(): Promise<CustomerReportEntity> {
    const [totalCustomers, activeCustomers, customersWithOrders] =
      await Promise.all([
        this.prisma.customer.count({
          where: {
            deleted_at: null,
          },
        }),

        this.prisma.customer.count({
          where: {
            deleted_at: null,
            user: {
              deleted_at: null,
            },
          },
        }),

        this.prisma.customer.count({
          where: {
            deleted_at: null,
            orders: {
              some: {
                deleted_at: null,
              },
            },
          },
        }),
      ]);

    return new CustomerReportEntity(
      totalCustomers,
      activeCustomers,
      customersWithOrders,
    );
  }

  async getDashboardSummary(): Promise<DashboardSummaryEntity> {
    const [
      totalCustomers,
      totalOrders,
      sales,
      totalProducts,
      lowStockItems,
      pendingCommissions,
    ] = await Promise.all([
      this.prisma.customer.count({
        where: {
          deleted_at: null,
        },
      }),

      this.prisma.order.count({
        where: {
          deleted_at: null,
        },
      }),

      this.prisma.order.aggregate({
        where: {
          deleted_at: null,
          status: 'CONFIRMED',
        },
        _sum: {
          total_amount: true,
        },
      }),

      this.prisma.product.count({
        where: {
          deleted_at: null,
        },
      }),

      this.prisma.inventory.count({
        where: {
          deleted_at: null,
          quantity: {
            lte: this.prisma.inventory.fields.min_stock,
          },
        },
      }),

      this.prisma.commission.aggregate({
        where: {
          deleted_at: null,
          status: 'PENDING',
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    return new DashboardSummaryEntity(
      totalCustomers,
      totalOrders,
      Number(sales._sum.total_amount ?? 0),
      totalProducts,
      lowStockItems,
      Number(pendingCommissions._sum.amount ?? 0),
    );
  }
}
