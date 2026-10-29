export interface AdminListQuery {
  page: number;
  limit: number;
  search?: string;
  status?: string;
}

export abstract class AdminReadRepository {
  abstract listOrders(query: AdminListQuery): Promise<unknown>;
  abstract listPayments(query: AdminListQuery): Promise<unknown>;
  abstract listDeliveries(query: AdminListQuery): Promise<unknown>;
  abstract listCustomers(query: AdminListQuery): Promise<unknown>;
  abstract getCustomer(customerId: string): Promise<unknown>;
  abstract listUsers(query: AdminListQuery): Promise<unknown>;
  abstract listInventory(query: AdminListQuery): Promise<unknown>;
  abstract listAuditLogs(query: AdminListQuery): Promise<unknown>;
  abstract listSettings(): Promise<unknown>;
  abstract listRoles(): Promise<unknown>;
  abstract listPermissions(): Promise<unknown>;
  abstract updateUser(userId: string, input: { roleId?: string; active?: boolean }, actorId: string): Promise<unknown>;
  abstract createUser(input: { email: string; passwordHash: string; roleId: string; firstName?: string; lastName?: string; phone?: string }, actorId: string): Promise<unknown>;
  abstract createRole(input: { name: string; permissionIds: string[] }, actorId: string): Promise<unknown>;
  abstract updateRole(roleId: string, input: { name?: string; permissionIds?: string[] }, actorId: string): Promise<unknown>;
  abstract upsertSetting(key: string, value: string, description: string | undefined, actorId: string): Promise<unknown>;
}
