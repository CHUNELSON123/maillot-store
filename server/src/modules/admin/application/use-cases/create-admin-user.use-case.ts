import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AdminReadRepository } from '../../domain/repositories/admin-read.repository';

@Injectable()
export class CreateAdminUserUseCase {
  constructor(private readonly repository: AdminReadRepository) {}

  async execute(input: { email: string; password: string; roleId: string; firstName?: string; lastName?: string; phone?: string }, actorId: string) {
    if (input.password.length < 8) throw new BadRequestException('Password must be at least 8 characters');
    const passwordHash = await bcrypt.hash(input.password, 12);
    return this.repository.createUser({ ...input, passwordHash }, actorId);
  }
}
