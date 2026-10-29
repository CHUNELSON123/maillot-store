import { BadRequestException, Injectable } from '@nestjs/common';
import {
  AdminListQuery,
  AdminReadRepository,
} from '../../domain/repositories/admin-read.repository';

@Injectable()
export class GetAdminRecordsUseCase {
  constructor(private readonly repository: AdminReadRepository) {}

  orders(query: AdminListQuery) {
    return this.repository.listOrders(query);
  }
  payments(query: AdminListQuery) {
    return this.repository.listPayments(query);
  }
  deliveries(query: AdminListQuery) {
    return this.repository.listDeliveries(query);
  }
  customers(query: AdminListQuery) {
    return this.repository.listCustomers(query);
  }
  customer(customerId: string) {
    return this.repository.getCustomer(customerId);
  }
  users(query: AdminListQuery) {
    return this.repository.listUsers(query);
  }
  inventory(query: AdminListQuery) {
    return this.repository.listInventory(query);
  }
  auditLogs(query: AdminListQuery) {
    return this.repository.listAuditLogs(query);
  }
  settings() {
    return this.repository.listSettings();
  }
  roles() { return this.repository.listRoles(); }
  permissions() { return this.repository.listPermissions(); }
  updateUser(userId: string, input: { roleId?: string; active?: boolean }, actorId: string) {
    return this.repository.updateUser(userId, input, actorId);
  }
  createUser(input: { email: string; passwordHash: string; roleId: string; firstName?: string; lastName?: string; phone?: string }, actorId: string) {
    return this.repository.createUser(input, actorId);
  }
  createRole(input: { name: string; permissionIds: string[] }, actorId: string) {
    return this.repository.createRole(input, actorId);
  }
  updateRole(roleId: string, input: { name?: string; permissionIds?: string[] }, actorId: string) {
    return this.repository.updateRole(roleId, input, actorId);
  }
  upsertSetting(
  key: string,
  value: string,
  description: string | undefined,
  actorId: string,
) {
  const settingKey = key.trim();

  const influencerRateKeys = [
    'influencer_default_commission_rate',
    'influencer_default_customer_discount_rate',
  ];

  if (influencerRateKeys.includes(settingKey)) {
    if (value.trim() === '') {
      throw new BadRequestException('A rate value is required');
    }

    const rate = Number(value);

    if (!Number.isFinite(rate) || rate < 0 || rate > 100) {
      throw new BadRequestException(
        'Influencer rates must be between 0 and 100',
      );
    }
  }

  return this.repository.upsertSetting(
    settingKey,
    value,
    description,
    actorId,
  );
}
}
