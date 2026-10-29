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

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
    ),
  );
}

function utcDayKey(date: Date): string {
  return startOfUtcDay(date).toISOString().slice(0, 10);
}

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

    const [
      totalOrders,
      confirmedOrders,
      cancelledOrders,
      sales,
    ] = await Promise.all([
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
    const [
      totalCustomers,
      activeCustomers,
      customersWithOrders,
    ] = await Promise.all([
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

  async getDashboardSummary(
    filter?: ReportFilter,
  ): Promise<DashboardSummaryEntity> {
    const today = startOfUtcDay(new Date());

    // Treat the selected end date as inclusive by making the query's
    // upper boundary the start of the following UTC day.
    const endDate = filter?.endDate
      ? new Date(startOfUtcDay(filter.endDate).getTime() + DAY_MS)
      : new Date(today.getTime() + DAY_MS);

    const startDate = filter?.startDate
      ? startOfUtcDay(filter.startDate)
      : new Date(endDate.getTime() - DAY_MS * 7);

    const periodDays = Math.max(
      1,
      Math.min(366, Math.ceil((endDate.getTime() - startDate.getTime()) / DAY_MS)),
    );

    const previousStartDate = new Date(
      startDate.getTime() - periodDays * DAY_MS,
    );

    const previousEndDate = startDate;

    const currentOrdersWhere = {
      deleted_at: null,
      created_at: {
        gte: startDate,
        lt: endDate,
      },
    };

    const previousOrdersWhere = {
      deleted_at: null,
      created_at: {
        gte: previousStartDate,
        lt: previousEndDate,
      },
    };

    const [
      totalOrders,
      previousOrders,
      customers,
      previousCustomers,
      influencers,
      previousInfluencers,
      currentSales,
      previousSales,
      ordersForChart,
      lowStockAlerts,
      lowStockItems,
      recentOrders,
      ordersForActivity,
      paidForActivity,
      influencersForActivity,
      movementsForActivity,
    ] = await Promise.all([
      this.prisma.order.count({
        where: currentOrdersWhere,
      }),

      this.prisma.order.count({
        where: previousOrdersWhere,
      }),

      this.prisma.customer.count({
        where: {
          deleted_at: null,
          created_at: {
            gte: startDate,
            lt: endDate,
          },
        },
      }),

      this.prisma.customer.count({
        where: {
          deleted_at: null,
          created_at: {
            gte: previousStartDate,
            lt: previousEndDate,
          },
        },
      }),

      this.prisma.influencer.count({
        where: {
          deleted_at: null,
          created_at: {
            gte: startDate,
            lt: endDate,
          },
        },
      }),

      this.prisma.influencer.count({
        where: {
          deleted_at: null,
          created_at: {
            gte: previousStartDate,
            lt: previousEndDate,
          },
        },
      }),

      this.prisma.order.aggregate({
        where: {
          ...currentOrdersWhere,
          status: 'CONFIRMED',
        },
        _sum: {
          total_amount: true,
        },
      }),

      this.prisma.order.aggregate({
        where: {
          ...previousOrdersWhere,
          status: 'CONFIRMED',
        },
        _sum: {
          total_amount: true,
        },
      }),

      // Fetch confirmed sales for both periods in one query.
      this.prisma.order.findMany({
        where: {
          deleted_at: null,
          status: 'CONFIRMED',
          created_at: {
            gte: previousStartDate,
            lt: endDate,
          },
        },
        select: {
          total_amount: true,
          created_at: true,
        },
      }),

      this.prisma.inventory.findMany({
        where: {
          deleted_at: null,
          quantity: {
            lte: this.prisma.inventory.fields.min_stock,
          },
        },
        orderBy: [
          { quantity: 'asc' },
          { updated_at: 'desc' },
        ],
        take: 5,
        include: {
          variant: {
            include: {
              product: {
                select: {
                  name: true,
                  images: {
                    where: {
                      deleted_at: null,
                    },
                    orderBy: {
                      is_primary: 'desc',
                    },
                    take: 1,
                    select: {
                      image_url: true,
                    },
                  },
                },
              },
            },
          },
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

      // Recent orders intentionally cover all dates, not only the
      // currently selected reporting period.
      this.prisma.order.findMany({
        where: {
          deleted_at: null,
        },
        orderBy: {
          created_at: 'desc',
        },
        take: 5,
        include: {
          customer: {
            select: {
              first_name: true,
              last_name: true,
            },
          },
          payment: {
            select: {
              status: true,
            },
          },
        },
      }),

      this.prisma.order.findMany({
        where: {
          deleted_at: null,
        },
        orderBy: {
          created_at: 'desc',
        },
        take: 10,
        select: {
          id: true,
          order_number: true,
          created_at: true,
        },
      }),

      this.prisma.payment.findMany({
        where: {
          deleted_at: null,
          status: 'PAID',
          paid_at: {
            not: null,
          },
        },
        orderBy: {
          paid_at: 'desc',
        },
        take: 10,
        include: {
          order: {
            select: {
              order_number: true,
            },
          },
        },
      }),

      this.prisma.influencer.findMany({
        where: {
          deleted_at: null,
          status: 'PENDING',
        },
        orderBy: {
          created_at: 'desc',
        },
        take: 10,
        select: {
          id: true,
          first_name: true,
          last_name: true,
          created_at: true,
        },
      }),

      this.prisma.inventoryMovement.findMany({
        where: {
          deleted_at: null,
        },
        orderBy: {
          created_at: 'desc',
        },
        take: 10,
        include: {
          variant: {
            include: {
              product: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
    ]);

    // Aggregate daily totals once rather than repeatedly filtering
    // the entire orders array for every chart point.
    const salesByDay = new Map<string, number>();

    for (const order of ordersForChart) {
      const key = utcDayKey(order.created_at);
      const amount = Number(order.total_amount);

      salesByDay.set(key, (salesByDay.get(key) ?? 0) + amount);
    }

    const salesOverview = Array.from(
      { length: periodDays },
      (_, index) => {
        const currentDay = new Date(
          startDate.getTime() + index * DAY_MS,
        );

        const previousDay = new Date(
          previousStartDate.getTime() + index * DAY_MS,
        );

        const currentKey = utcDayKey(currentDay);
        const previousKey = utcDayKey(previousDay);

        return {
          label: currentDay.toLocaleDateString('en', {
            month: 'short',
            day: 'numeric',
            timeZone: 'UTC',
          }),
          current: salesByDay.get(currentKey) ?? 0,
          previous: salesByDay.get(previousKey) ?? 0,
        };
      },
    );

    const activity = [
      ...ordersForActivity.map((order) => ({
        id: `order-${order.id}`,
        type: 'order',
        message: `New order #${order.order_number}`,
        createdAt: order.created_at,
      })),

      ...paidForActivity.map((payment) => ({
        id: `payment-${payment.id}`,
        type: 'payment',
        message: `Payment received for order #${payment.order.order_number}`,
        createdAt: payment.paid_at!,
      })),

      ...influencersForActivity.map((influencer) => ({
        id: `influencer-${influencer.id}`,
        type: 'influencer',
        message: `New influencer application from ${
          [
            influencer.first_name,
            influencer.last_name,
          ]
            .filter(Boolean)
            .join(' ') || 'Applicant'
        }`,
        createdAt: influencer.created_at,
      })),

      ...movementsForActivity.map((movement) => ({
        id: `stock-${movement.id}`,
        type: 'inventory',
        message: `Stock updated: ${movement.variant.product.name}`,
        createdAt: movement.created_at,
      })),
    ]
      .sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      )
      .slice(0, 20);

    const change = (current: number, previous: number) =>
      previous === 0
        ? null
        : Math.round(((current - previous) / previous) * 100);

    const totalSales = Number(currentSales._sum.total_amount ?? 0);
    const previousTotalSales = Number(
      previousSales._sum.total_amount ?? 0,
    );

    return new DashboardSummaryEntity(
      customers,
      totalOrders,
      influencers,
      totalSales,
      lowStockItems,
      salesOverview,

      recentOrders.map((order) => ({
        id: order.id,
        orderNumber: order.order_number,
        customerName: order.customer
          ? `${order.customer.first_name} ${order.customer.last_name}`.trim()
          : order.guest_name ?? order.guest_email ?? 'Guest',
        totalAmount: Number(order.total_amount),
        paymentStatus: order.payment?.status ?? null,
        status: order.status,
        createdAt: order.created_at,
      })),

      lowStockAlerts.map((stock) => ({
        id: stock.id,
        productName: stock.variant.product.name,
        imageUrl: stock.variant.product.images[0]?.image_url ?? null,
        variantLabel:
          [
            stock.variant.size,
            stock.variant.color,
          ].filter(Boolean).join(' / ') || stock.variant.sku,
        sku: stock.variant.sku,
        quantity: stock.quantity,
        minStock: stock.min_stock,
      })),

      activity,

      {
        totalSales: change(totalSales, previousTotalSales),
        totalOrders: change(totalOrders, previousOrders),
        totalCustomers: change(customers, previousCustomers),
        totalInfluencers: change(influencers, previousInfluencers),
      },

      {
        startDate,
        endDate: new Date(endDate.getTime() - 1),
        previousStartDate,
        previousEndDate: new Date(previousEndDate.getTime() - 1),
      },
    );
  }
}