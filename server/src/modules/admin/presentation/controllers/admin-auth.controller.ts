import { Body, Controller, Post } from '@nestjs/common';
import { LoginAdministratorUseCase } from '../../application/use-cases/login-administrator.use-case';
import { RegisterAdministratorUseCase } from '../../application/use-cases/register-administrator.use-case';
import { AdminAuthDto } from '../dto/admin-auth.dto';

@Controller({ path: 'admin/auth', version: '1' })
export class AdminAuthController {
  constructor(private readonly register: RegisterAdministratorUseCase, private readonly login: LoginAdministratorUseCase) {}

  @Post('register') registerAdministrator(@Body() dto: AdminAuthDto) { return this.register.execute(dto); }
  @Post('login') loginAdministrator(@Body() dto: AdminAuthDto) { return this.login.execute(dto); }
}
