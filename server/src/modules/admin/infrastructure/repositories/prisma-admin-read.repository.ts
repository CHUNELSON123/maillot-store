import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import {
  AdminListQuery,
  AdminReadRepository,
} from '../../domain/repositories/admin-read.repository';

const pageArgs = (query: AdminListQuery) => ({
  skip: (query.page - 1) * query.limit,
  take: query.limit,
});

@Injectable()
export class PrismaAdminReadRepository implements AdminReadRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listOrders(query: AdminListQuery) {
    const where = {
      deleted_at: null,
      ...(query.status ? { status: query.status.toUpperCase() } : {}),
      ...(query.source ? { source: query.source } : {}),
      ...(query.paymentStatus ? { payment: { is: { status: query.paymentStatus } } } : {}),
      ...(query.startDate || query.endDate ? { created_at: {
        ...(query.startDate ? { gte: new Date(query.startDate) } : {}),
        ...(query.endDate ? { lte: new Date(query.endDate) } : {}),
      } } : {}),
      ...(query.search
        ? {
            OR: [
              { order_number: { contains: query.search, mode: 'insensitive' as const } },
              { guest_name: { contains: query.search, mode: 'insensitive' as const } },
              { guest_email: { contains: query.search, mode: 'insensitive' as const } },
              { customer: { is: { OR: [
                { first_name: { contains: query.search, mode: 'insensitive' as const } },
                { last_name: { contains: query.search, mode: 'insensitive' as const } },
                { user: { is: { email: { contains: query.search, mode: 'insensitive' as const } } } },
              ] } } },
            ],
          }
        : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        ...pageArgs(query),
        orderBy: { created_at: 'desc' },
        include: {
          customer: { include: { user: { select: { email: true } } } },
          items: { where: { deleted_at: null }, include: { variant: { include: { product: true } } } },
          payment: { include: { payment_method: true } },
          delivery: true,
        },
      }),
      this.prisma.order.count({ where }),
    ]);
    return { items: items.map(({ guest_access_token_hash: _guestTokenHash, ...order }) => order), total, page: query.page, limit: query.limit };
  }

  async listPayments(query: AdminListQuery) {
    const searchIsUuid = Boolean(query.search && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(query.search));
    const where = {
      deleted_at: null,
      ...(query.status ? { status: query.status.toUpperCase() } : {}),
      ...(query.paymentMethod ? { payment_method: { is: { name: query.paymentMethod } } } : {}),
      ...(query.startDate || query.endDate ? { created_at: {
        ...(query.startDate ? { gte: new Date(query.startDate) } : {}),
        ...(query.endDate ? { lte: new Date(query.endDate) } : {}),
      } } : {}),
      ...(query.search
        ? { OR: [
            ...(searchIsUuid ? [{ id: query.search! }] : []),
            { order: { is: { order_number: { contains: query.search, mode: 'insensitive' as const } } } },
            { transaction_reference: { contains: query.search, mode: 'insensitive' as const } },
            { order: { is: { guest_name: { contains: query.search, mode: 'insensitive' as const } } } },
            { order: { is: { guest_email: { contains: query.search, mode: 'insensitive' as const } } } },
            { order: { is: { customer: { is: { OR: [
              { first_name: { contains: query.search, mode: 'insensitive' as const } },
              { last_name: { contains: query.search, mode: 'insensitive' as const } },
              { user: { is: { email: { contains: query.search, mode: 'insensitive' as const } } } },
            ] } } } } },
          ] }
        : {}),
    };
    const now = new Date();
    const currentStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const previousStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const [items, total, currentGroups, previousGroups] = await Promise.all([
      this.prisma.payment.findMany({ where, ...pageArgs(query), orderBy: { created_at: 'desc' }, include: { payment_method: true, order: { include: { customer: { include: { user: { select: { email: true } } } } } } } }),
      this.prisma.payment.count({ where }),
      this.prisma.payment.groupBy({ by: ['status'], where: { deleted_at: null, created_at: { gte: currentStart, lte: now } }, _count: { _all: true }, _sum: { amount: true } }),
      this.prisma.payment.groupBy({ by: ['status'], where: { deleted_at: null, created_at: { gte: previousStart, lt: currentStart } }, _count: { _all: true }, _sum: { amount: true } }),
    ]);
    const summarize = (groups: typeof currentGroups) => {
      const count = (status: string) => groups.find((item) => item.status === status)?._count._all ?? 0;
      const paidAmount = Number(groups.find((item) => item.status === 'PAID')?._sum.amount ?? 0);
      return { totalPayments: groups.reduce((sum, item) => sum + item._count._all, 0), totalAmount: paidAmount, successfulPayments: count('PAID'), pendingPayments: count('PENDING'), failedPayments: count('FAILED') };
    };
    const currentSummary = summarize(currentGroups);
    const previousSummary = summarize(previousGroups);
    const percentChange = (current: number, previous: number) => previous === 0 ? null : Math.round(((current - previous) / previous) * 100);
    const summary = {
      ...currentSummary,
      changes: {
        totalPayments: percentChange(currentSummary.totalPayments, previousSummary.totalPayments),
        totalAmount: percentChange(currentSummary.totalAmount, previousSummary.totalAmount),
        successfulPayments: percentChange(currentSummary.successfulPayments, previousSummary.successfulPayments),
        pendingPayments: percentChange(currentSummary.pendingPayments, previousSummary.pendingPayments),
        failedPayments: percentChange(currentSummary.failedPayments, previousSummary.failedPayments),
      },
    };
    return {
      items: items.map((payment) => ({
        ...payment,
        order: payment.order
          ? (({ guest_access_token_hash: _guestTokenHash, ...order }) => order)(payment.order)
          : payment.order,
      })),
      total,
      page: query.page,
      limit: query.limit,
      summary,
    };
  }

  async listDeliveries(query: AdminListQuery) {
    const searchIsUuid = Boolean(query.search && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(query.search));
    const where = {
      deleted_at: null,
      ...(query.status ? { delivery_status: query.status.toUpperCase() === 'IN_TRANSIT' ? { in: ['ASSIGNED', 'PROCESSING', 'IN_TRANSIT', 'SHIPPED', 'OUT_FOR_DELIVERY'] } : query.status.toUpperCase() } : {}),
      ...(query.provider ? { provider: { contains: query.provider, mode: 'insensitive' as const } } : {}),
      ...(query.startDate || query.endDate ? { created_at: {
        ...(query.startDate ? { gte: new Date(query.startDate) } : {}),
        ...(query.endDate ? { lte: new Date(query.endDate) } : {}),
      } } : {}),
      ...(query.search ? { OR: [
        { tracking_number: { contains: query.search, mode: 'insensitive' as const } },
        { order: { is: { order_number: { contains: query.search, mode: 'insensitive' as const } } } },
        { provider: { contains: query.search, mode: 'insensitive' as const } },
        { order: { is: { guest_name: { contains: query.search, mode: 'insensitive' as const } } } },
        { order: { is: { guest_email: { contains: query.search, mode: 'insensitive' as const } } } },
        { order: { is: { customer: { is: { OR: [
          { first_name: { contains: query.search, mode: 'insensitive' as const } },
          { last_name: { contains: query.search, mode: 'insensitive' as const } },
          { user: { is: { email: { contains: query.search, mode: 'insensitive' as const } } } },
        ] } } } } },
        ...(searchIsUuid ? [{ id: query.search! }] : []),
      ] } : {}),
    };
    const now = new Date();
    const currentStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const previousStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const [items, total, currentGroups, previousGroups, partnerRows] = await Promise.all([
      this.prisma.delivery.findMany({ where, ...pageArgs(query), orderBy: { created_at: 'desc' }, include: { order: { include: { customer: true } } } }),
      this.prisma.delivery.count({ where }),
      this.prisma.delivery.groupBy({ by: ['delivery_status'], where: { deleted_at: null, created_at: { gte: currentStart, lte: now } }, _count: { _all: true } }),
      this.prisma.delivery.groupBy({ by: ['delivery_status'], where: { deleted_at: null, created_at: { gte: previousStart, lt: currentStart } }, _count: { _all: true } }),
      this.prisma.delivery.findMany({ where: { deleted_at: null, provider: { not: null } }, distinct: ['provider'], select: { provider: true }, orderBy: { provider: 'asc' } }),
    ]);
    const summarize = (groups: typeof currentGroups) => {
      const count = (...statuses: string[]) => groups.filter((item) => statuses.includes(item.delivery_status.toUpperCase())).reduce((sum, item) => sum + item._count._all, 0);
      return {
        totalDeliveries: groups.reduce((sum, item) => sum + item._count._all, 0),
        inTransit: count('ASSIGNED', 'PROCESSING', 'IN_TRANSIT', 'SHIPPED', 'OUT_FOR_DELIVERY'),
        delivered: count('DELIVERED'),
        pending: count('PENDING'),
        failed: count('FAILED'),
      };
    };
    const currentSummary = summarize(currentGroups);
    const previousSummary = summarize(previousGroups);
    const percentChange = (current: number, previous: number) => previous === 0 ? null : Math.round(((current - previous) / previous) * 100);
    const summary = {
      ...currentSummary,
      changes: {
        totalDeliveries: percentChange(currentSummary.totalDeliveries, previousSummary.totalDeliveries),
        inTransit: percentChange(currentSummary.inTransit, previousSummary.inTransit),
        delivered: percentChange(currentSummary.delivered, previousSummary.delivered),
        pending: percentChange(currentSummary.pending, previousSummary.pending),
        failed: percentChange(currentSummary.failed, previousSummary.failed),
      },
    };
    return {
      items: items.map((delivery) => ({
        ...delivery,
        order: delivery.order
          ? (({ guest_access_token_hash: _guestTokenHash, ...order }) => order)(delivery.order)
          : delivery.order,
      })),
      total,
      page: query.page,
      limit: query.limit,
      summary,
      partners: partnerRows.map((row) => row.provider).filter((provider): provider is string => Boolean(provider)),
    };
  }

  async listCustomers(query: AdminListQuery) {
    const where = {
      deleted_at: null,
      ...(query.status === 'ACTIVE' ? { user: { is: { deleted_at: null } } } : query.status === 'INACTIVE' ? { user: { is: { deleted_at: { not: null } } } } : {}),
      ...(query.registrationSource ? { registration_source: query.registrationSource } : {}),
      ...(query.search ? { OR: [
        { first_name: { contains: query.search, mode: 'insensitive' as const } },
        { last_name: { contains: query.search, mode: 'insensitive' as const } },
        { user: { is: { email: { contains: query.search, mode: 'insensitive' as const } } } },
        { phone: { contains: query.search, mode: 'insensitive' as const } },
      ] } : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.customer.findMany({ where, ...pageArgs(query), orderBy: { created_at: 'desc' }, include: { user: { select: { id: true, email: true, created_at: true, deleted_at: true, role: { select: { name: true } } } }, _count: { select: { orders: { where: { deleted_at: null } } } }, orders: { where: { deleted_at: null, status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] } }, select: { total_amount: true } } } }),
      this.prisma.customer.count({ where }),
    ]);
    return { items: items.map((customer) => ({ ...customer, status: customer.user.deleted_at ? 'INACTIVE' : 'ACTIVE', total_spent: customer.orders.reduce((sum, order) => sum + Number(order.total_amount), 0), orders: undefined })), total, page: query.page, limit: query.limit };
  }

  async getCustomer(customerId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, deleted_at: null },
      include: {
        user: { select: { id: true, email: true, created_at: true, deleted_at: true, role: { select: { name: true } } } },
        addresses: { where: { deleted_at: null }, orderBy: { created_at: 'desc' } },
        orders: {
          where: { deleted_at: null },
          orderBy: { created_at: 'desc' },
          take: 20,
          include: {
            items: {
              where: { deleted_at: null },
              include: { variant: { include: { product: { select: { name: true } } } } },
            },
            payment: { include: { payment_method: { select: { name: true } } } },
            delivery: true,
          },
        },
      },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return { ...customer, status: customer.user.deleted_at ? 'INACTIVE' : 'ACTIVE', orders: customer.orders.map(({ guest_access_token_hash: _guestTokenHash, ...order }) => order) };
  }

  async updateCustomer(customerId: string, input: { firstName: string; lastName: string; phone?: string; email: string }, actorId: string) {
    return this.prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findFirst({ where: { id: customerId, deleted_at: null }, select: { id: true, user_id: true } });
      if (!customer) throw new NotFoundException('Customer not found');
      const email = input.email.trim().toLowerCase();
      const duplicate = await tx.user.findFirst({ where: { email, id: { not: customer.user_id } }, select: { id: true } });
      if (duplicate) throw new ConflictException('Email is already registered');
      const [updatedCustomer, updatedUser] = await Promise.all([
        tx.customer.update({ where: { id: customer.id }, data: { first_name: input.firstName.trim(), last_name: input.lastName.trim(), phone: input.phone?.trim() || null, updated_by: actorId } }),
        tx.user.update({ where: { id: customer.user_id }, data: { email, updated_by: actorId }, select: { email: true } }),
      ]);
      await tx.auditLog.create({ data: { user_id: actorId, action: 'ADMIN_CUSTOMER_UPDATED', entity: 'Customer', entity_id: customer.id, details: JSON.stringify({ email }) } });
      return { ...updatedCustomer, user: updatedUser };
    });
  }

  async updateCustomerStatus(customerId: string, active: boolean, actorId: string) {
    const customer = await this.prisma.customer.findFirst({ where: { id: customerId, deleted_at: null }, select: { user_id: true } });
    if (!customer) throw new NotFoundException('Customer not found');
    return this.updateUser(customer.user_id, { active }, actorId);
  }

  async listUsers(query: AdminListQuery) {
    const where = {
      ...(query.status === 'INACTIVE' ? { deleted_at: { not: null } } : query.status === 'ACTIVE' ? { deleted_at: null } : {}),
      ...(query.roleId ? { role_id: query.roleId } : {}),
      ...(query.search ? { OR: [
        { email: { contains: query.search, mode: 'insensitive' as const } },
        { role: { is: { name: { contains: query.search, mode: 'insensitive' as const } } } },
      ] } : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({ where, ...pageArgs(query), orderBy: { created_at: 'desc' }, select: { id: true, email: true, created_at: true, updated_at: true, last_login_at: true, deleted_at: true, role: { select: { id: true, name: true, permissions: { select: { id: true, name: true } } } }, customer: { select: { first_name: true, last_name: true } }, influencer: { select: { status: true } } } }),
      this.prisma.user.count({ where }),
    ]);
    return { items, total, page: query.page, limit: query.limit };
  }

  async listInventory(query: AdminListQuery) {
    const statusRows = query.status
      ? await this.prisma.$queryRaw<{ id: string }[]>`
          SELECT id FROM inventory
          WHERE deleted_at IS NULL
            AND (
              (${query.status} = 'IN_STOCK' AND quantity > min_stock)
              OR (${query.status} = 'LOW_STOCK' AND quantity > 0 AND quantity <= min_stock)
              OR (${query.status} = 'OUT_OF_STOCK' AND quantity = 0)
            )
        `
      : undefined;
    const where = {
      deleted_at: null,
      ...(statusRows ? { id: { in: statusRows.map((row) => row.id) } } : {}),
      ...(query.search || query.categoryId || query.brandId ? { variant: { is: {
        ...(query.search ? { OR: [
          { sku: { contains: query.search, mode: 'insensitive' as const } },
          { product: { is: { name: { contains: query.search, mode: 'insensitive' as const } } } },
        ] } : {}),
        ...(query.categoryId || query.brandId ? { product: { is: {
          ...(query.categoryId ? { category_id: query.categoryId } : {}),
          ...(query.brandId ? { brand_id: query.brandId } : {}),
        } } } : {}),
      } } } : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.inventory.findMany({ where, ...pageArgs(query), orderBy: { updated_at: 'desc' }, include: { variant: { include: { product: { include: { category: true, brand: true, images: { where: { deleted_at: null }, orderBy: [{ is_primary: 'desc' }, { created_at: 'asc' }], take: 1 } } } } } } }),
      this.prisma.inventory.count({ where }),
    ]);
    return { items, total, page: query.page, limit: query.limit };
  }

  async listAuditLogs(query: AdminListQuery) {
    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({ where: { deleted_at: null }, ...pageArgs(query), orderBy: { created_at: 'desc' }, include: { user: { select: { email: true } } } }),
      this.prisma.auditLog.count({ where: { deleted_at: null } }),
    ]);
    return { items, total, page: query.page, limit: query.limit };
  }

  async listSettings() {
    const settings = await this.prisma.systemSetting.findMany({ where: { deleted_at: null }, orderBy: { key: 'asc' } });
    return settings.map(({ value, ...setting }) => ({ ...setting, value: /secret|password|token|api[_-]?key/i.test(setting.key) ? null : value, isSensitive: /secret|password|token|api[_-]?key/i.test(setting.key) }));
  }

  listRoles() {
    return this.prisma.role.findMany({ where: { deleted_at: null }, orderBy: { name: 'asc' }, include: { permissions: { select: { id: true, name: true, description: true } }, _count: { select: { users: true } } } });
  }

  listPermissions() {
    return this.prisma.permission.findMany({ where: { deleted_at: null }, orderBy: { name: 'asc' }, select: { id: true, name: true, description: true } });
  }

  async updateUser(userId: string, input: { roleId?: string; active?: boolean }, actorId: string) {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findFirst({ where: { id: userId }, include: { role: true } });
      if (!user) throw new NotFoundException('User not found');
      const nextRole = input.roleId ? await tx.role.findFirst({ where: { id: input.roleId, deleted_at: null } }) : user.role;
      if (!nextRole) throw new NotFoundException('Role not found');
      const removingAdmin = user.role.name === 'Administrator' && (nextRole.name !== 'Administrator' || input.active === false) && user.deleted_at === null;
      if (removingAdmin) {
        const otherActiveAdmins = await tx.user.count({ where: { id: { not: user.id }, deleted_at: null, role: { is: { name: 'Administrator', deleted_at: null } } } });
        if (otherActiveAdmins === 0) throw new ConflictException('The last active administrator cannot be deactivated or demoted');
      }
      const updated = await tx.user.update({ where: { id: userId }, data: { ...(input.roleId && { role_id: input.roleId }), ...(input.active !== undefined && { deleted_at: input.active ? null : new Date() }) }, select: { id: true, email: true, role: { select: { id: true, name: true } }, deleted_at: true } });
      await tx.auditLog.create({ data: { user_id: actorId, action: 'ADMIN_USER_UPDATED', entity: 'User', entity_id: userId, details: JSON.stringify({ roleId: input.roleId, active: input.active }) } });
      return updated;
    });
  }

  async createUser(input: { email: string; passwordHash: string; roleId: string; firstName?: string; lastName?: string; phone?: string }, actorId: string) {
    const role = await this.prisma.role.findFirst({ where: { id: input.roleId, deleted_at: null } });
    if (!role) throw new NotFoundException('Role not found');
    if (role.name === 'Influencer') throw new ConflictException('Influencer accounts must be created through the application review workflow');
    if (role.name === 'Customer' && (!input.firstName?.trim() || !input.lastName?.trim())) throw new ConflictException('Customer accounts require first and last names');
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({ data: { email: input.email.trim().toLowerCase(), password: input.passwordHash, role_id: input.roleId, ...(role.name === 'Customer' ? { customer: { create: { first_name: input.firstName!.trim(), last_name: input.lastName!.trim(), phone: input.phone?.trim(), registration_source: 'ADMIN' } } } : {}) }, select: { id: true, email: true, role: { select: { name: true } }, created_at: true } });
      await tx.auditLog.create({ data: { user_id: actorId, action: 'ADMIN_USER_CREATED', entity: 'User', entity_id: user.id, details: JSON.stringify({ email: user.email, role: role.name }) } });
      return user;
    });
  }

  async createRole(input: { name: string; permissionIds: string[] }, actorId: string) {
    const roleName = input.name.trim();
    if (['administrator', 'staff', 'customer', 'influencer'].includes(roleName.toLowerCase())) {
      throw new ConflictException('Built-in role names are reserved');
    }
    return this.prisma.$transaction(async (tx) => {
      const role = await tx.role.create({ data: { name: roleName, permissions: { connect: input.permissionIds.map((id) => ({ id })) } }, include: { permissions: { select: { id: true, name: true } } } });
      await tx.auditLog.create({ data: { user_id: actorId, action: 'ADMIN_ROLE_CREATED', entity: 'Role', entity_id: role.id, details: JSON.stringify({ permissionIds: input.permissionIds }) } });
      return role;
    });
  }

  async updateRole(roleId: string, input: { name?: string; permissionIds?: string[] }, actorId: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.role.findFirst({ where: { id: roleId, deleted_at: null } });
      if (!existing) throw new NotFoundException('Role not found');
      if (existing.name === 'Administrator' && input.name !== undefined && input.name !== existing.name) {
        throw new ConflictException('The Administrator role name is reserved and cannot be changed');
      }
      if (input.name !== undefined && input.name !== existing.name && ['administrator', 'staff', 'customer', 'influencer'].includes(input.name.trim().toLowerCase())) {
        throw new ConflictException('Built-in role names are reserved');
      }
      const updated = await tx.role.update({ where: { id: roleId }, data: { ...(input.name !== undefined && { name: input.name.trim() }), ...(input.permissionIds !== undefined && { permissions: { set: input.permissionIds.map((id) => ({ id })) } }) }, include: { permissions: { select: { id: true, name: true } }, _count: { select: { users: true } } } });
      await tx.auditLog.create({ data: { user_id: actorId, action: 'ADMIN_ROLE_UPDATED', entity: 'Role', entity_id: roleId, details: JSON.stringify({ permissionIds: input.permissionIds }) } });
      return updated;
    });
  }

  async upsertSetting(key: string, value: string, description: string | undefined, actorId: string) {
    const settingKey = key.trim();
    if (!settingKey) throw new ConflictException('Setting key is required');
    if (['default_currency', 'payment_currency'].includes(settingKey) && value !== 'XAF') {
      throw new ConflictException('Only XAF is currently supported by the catalogue and configured payment methods');
    }
    return this.prisma.$transaction(async (tx) => {
      const setting = await tx.systemSetting.upsert({ where: { key: settingKey }, create: { key: settingKey, value, description }, update: { value, ...(description !== undefined && { description }) } });
      if (settingKey === 'low_stock_threshold') {
        const threshold = Number(value);
        if (!Number.isSafeInteger(threshold) || threshold < 0) {
          throw new ConflictException('Low stock threshold must be a non-negative whole number');
        }
        await tx.inventory.updateMany({
          where: { deleted_at: null },
          data: { min_stock: threshold },
        });
      }
      if (settingKey === 'payment_methods_enabled') {
        const aliases: Record<string, string> = {
          mtn: 'MTN Mobile Money', 'mtn mobile money': 'MTN Mobile Money',
          orange: 'Orange Money', 'orange money': 'Orange Money',
          card: 'Bank Card', 'bank card': 'Bank Card', visa: 'Bank Card',
          cash: 'Cash Before Delivery', 'cash before delivery': 'Cash Before Delivery', cod: 'Cash Before Delivery',
        };
        const methodNames = [...new Set(value.split(/[\n,;]+/).map((name) => aliases[name.trim().toLowerCase()]).filter(Boolean))];
        await tx.paymentMethod.updateMany({ where: { deleted_at: null }, data: { is_active: false } });
        if (methodNames.length) {
          await tx.paymentMethod.updateMany({ where: { name: { in: methodNames }, deleted_at: null }, data: { is_active: true } });
        }
      }
      if (settingKey === 'influencer_default_commission_rate') {
        const rate = Number(value);
        if (Number.isFinite(rate) && rate >= 0 && rate <= 100) {
          await tx.influencer.updateMany({ where: { deleted_at: null }, data: { commission_rate: rate } });
        }
      }
      if (settingKey === 'influencer_default_customer_discount_rate') {
        const rate = Number(value);
        if (Number.isFinite(rate) && rate >= 0 && rate <= 100) {
          await tx.influencer.updateMany({ where: { deleted_at: null }, data: { customer_discount_rate: rate } });
        }
      }
      await tx.auditLog.create({ data: { user_id: actorId, action: 'ADMIN_SETTING_UPDATED', entity: 'SystemSetting', entity_id: setting.id, details: JSON.stringify({ key: settingKey }) } });
      const isSensitive = /secret|password|token|api[_-]?key/i.test(settingKey);
      return { ...setting, value: isSensitive ? null : setting.value, isSensitive };
    });
  }
}
