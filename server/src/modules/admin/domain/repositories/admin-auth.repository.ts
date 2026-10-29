export abstract class AdminAuthRepository {
  abstract createAdministratorAccount(input: { email: string; passwordHash: string }): Promise<{ id: string; email: string }>;
}
