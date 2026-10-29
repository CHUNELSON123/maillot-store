import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AdminAuthRepository } from '../../domain/repositories/admin-auth.repository';

@Injectable()
export class RegisterAdministratorUseCase {
  constructor(private readonly repository: AdminAuthRepository) {}

  async execute(input: { email: string; password: string }) {
    try {
      return await this.repository.createAdministratorAccount({
        email: input.email.trim().toLowerCase(),
        passwordHash: await bcrypt.hash(input.password, 12),
      });
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
        throw new ConflictException('Email is already registered');
      }
      throw error;
    }
  }
}
