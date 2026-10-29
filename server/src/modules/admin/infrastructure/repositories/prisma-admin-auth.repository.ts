import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { AdminAuthRepository } from '../../domain/repositories/admin-auth.repository';

@Injectable()
export class PrismaAdminAuthRepository implements AdminAuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  createAdministratorAccount(input: { email: string; passwordHash: string }) {
    return this.prisma.$transaction(async (tx) => {
      const [lock] = await tx.$queryRaw<Array<{ locked: boolean }>>`SELECT pg_try_advisory_xact_lock(716284901) AS locked`;
      if (!lock?.locked) throw new ConflictException('Administrator registration is already in progress. Please try again.');
      const administratorCount = await tx.user.count({ where: { role: { is: { name: 'Administrator' } } } });
      if (administratorCount >= 3) throw new ConflictException('The store has reached its limit of three Administrator accounts.');
      const role = await tx.role.findFirst({ where: { name: 'Administrator', deleted_at: null } });
      if (!role) throw new NotFoundException('Administrator role is not configured. Run the project database seed first.');
      const user = await tx.user.create({
        data: { email: input.email, password: input.passwordHash, role_id: role.id },
        select: { id: true, email: true },
      });
      await tx.auditLog.create({ data: { user_id: user.id, action: 'ADMINISTRATOR_REGISTERED', entity: 'User', entity_id: user.id, details: JSON.stringify({ email: user.email }) } });
      return user;
    });
  }
}
