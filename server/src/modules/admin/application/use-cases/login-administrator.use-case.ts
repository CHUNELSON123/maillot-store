import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginUseCase } from '../../../auth/application/use-cases/login.use-case';
import { UserRepository } from '../../../auth/domain/repositories/user.repository';

@Injectable()
export class LoginAdministratorUseCase {
  constructor(private readonly users: UserRepository, private readonly login: LoginUseCase) {}

  async execute(input: { email: string; password: string }) {
    const email = input.email.trim().toLowerCase();
    const user = await this.users.findByEmail(email);
    if (!user || user.roleName !== 'Administrator') throw new UnauthorizedException('Invalid administrator email or password');
    return this.login.execute({ ...input, email });
  }
}
