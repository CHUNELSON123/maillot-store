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
    const where = {
      deleted_at: null,
      ...(query.status ? { status: query.status.toUpperCase() } : {}),
      ...(query.search
        ? { OR: [
            { order: { is: { order_number: { contains: query.search, mode: 'insensitive' as const } } } },
            { transaction_reference: { contains: query.search, mode: 'insensitive' as const } },
          ] }
        : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.payment.findMany({ where, ...pageArgs(query), orderBy: { created_at: 'desc' }, include: { payment_method: true, order: { include: { customer: { include: { user: { select: { email: true } } } } } } } }),
      this.prisma.payment.count({ where }),
    ]);
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
    };
  }

  async listDeliveries(query: AdminListQuery) {
    const where = {
      deleted_at: null,
      ...(query.status ? { delivery_status: query.status.toUpperCase() } : {}),
      ...(query.search ? { OR: [
        { tracking_number: { contains: query.search, mode: 'insensitive' as const } },
        { order: { is: { order_number: { contains: query.search, mode: 'insensitive' as const } } } },
      ] } : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.delivery.findMany({ where, ...pageArgs(query), orderBy: { created_at: 'desc' }, include: { order: { include: { customer: true } } } }),
      this.prisma.delivery.count({ where }),
    ]);
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
    };
  }

  async listCustomers(query: AdminListQuery) {
    const where = {
      deleted_at: null,
      ...(query.search ? { OR: [
        { first_name: { contains: query.search, mode: 'insensitive' as const } },
        { last_name: { contains: query.search, mode: 'insensitive' as const } },
        { user: { is: { email: { contains: query.search, mode: 'insensitive' as const } } } },
        { phone: { contains: query.search, mode: 'insensitive' as const } },
      ] } : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.customer.findMany({ where, ...pageArgs(query), orderBy: { created_at: 'desc' }, include: { user: { select: { id: true, email: true, created_at: true, role: { select: { name: true } } } }, _count: { select: { orders: true } }, orders: { where: { deleted_at: null, status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] } }, select: { total_amount: true } } } }),
      this.prisma.customer.count({ where }),
    ]);
    return { items: items.map((customer) => ({ ...customer, total_spent: customer.orders.reduce((sum, order) => sum + Number(order.total_amount), 0), orders: undefined })), total, page: query.page, limit: query.limit };
  }

  async getCustomer(customerId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, deleted_at: null },
      include: {
        user: { select: { id: true, email: true, created_at: true, role: { select: { name: true } } } },
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
    return { ...customer, orders: customer.orders.map(({ guest_access_token_hash: _guestTokenHash, ...order }) => order) };
  }

  async listUsers(query: AdminListQuery) {
    const where = {
      ...(query.status === 'INACTIVE' ? { deleted_at: { not: null } } : query.status === 'ACTIVE' ? { deleted_at: null } : {}),
      ...(query.search ? { OR: [
        { email: { contains: query.search, mode: 'insensitive' as const } },
        { role: { is: { name: { contains: query.search, mode: 'insensitive' as const } } } },
      ] } : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({ where, ...pageArgs(query), orderBy: { created_at: 'desc' }, select: { id: true, email: true, created_at: true, updated_at: true, deleted_at: true, role: { select: { id: true, name: true, permissions: { select: { id: true, name: true } } } }, customer: { select: { first_name: true, last_name: true } }, influencer: { select: { status: true } } } }),
      this.prisma.user.count({ where }),
    ]);
    return { items, total, page: query.page, limit: query.limit };
  }

  async listInventory(query: AdminListQuery) {
    const where = {
      deleted_at: null,
      ...(query.search ? { variant: { is: { OR: [
        { sku: { contains: query.search, mode: 'insensitive' as const } },
        { product: { is: { name: { contains: query.search, mode: 'insensitive' as const } } } },
      ] } } } : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.inventory.findMany({ where, ...pageArgs(query), orderBy: { updated_at: 'desc' }, include: { variant: { include: { product: { include: { category: true, brand: true } } } } } }),
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
      const user = await tx.user.create({ data: { email: input.email.trim().toLowerCase(), password: input.passwordHash, role_id: input.roleId, ...(role.name === 'Customer' ? { customer: { create: { first_name: input.firstName!.trim(), last_name: input.lastName!.trim(), phone: input.phone?.trim() } } } : {}) }, select: { id: true, email: true, role: { select: { name: true } }, created_at: true } });
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
    return this.prisma.$transaction(async (tx) => {
      const setting = await tx.systemSetting.upsert({ where: { key: settingKey }, create: { key: settingKey, value, description }, update: { value, ...(description !== undefined && { description }) } });
      await tx.auditLog.create({ data: { user_id: actorId, action: 'ADMIN_SETTING_UPDATED', entity: 'SystemSetting', entity_id: setting.id, details: JSON.stringify({ key: settingKey }) } });
      const isSensitive = /secret|password|token|api[_-]?key/i.test(settingKey);
      return { ...setting, value: isSensitive ? null : setting.value, isSensitive };
    });
  }
}
