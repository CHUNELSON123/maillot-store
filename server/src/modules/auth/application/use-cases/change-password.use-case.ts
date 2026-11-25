import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../../domain/repositories/user.repository';

@Injectable()
export class ChangePasswordUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.users.findById(userId);
    if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    await this.users.updatePassword(userId, await bcrypt.hash(newPassword, 10));
  }
}
