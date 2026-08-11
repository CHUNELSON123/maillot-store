import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { RegisterCustomerUseCase } from '../../application/use-cases/register-customer.use-case';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../../common/guards/roles.guard';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    roleId: string;
  };
}

@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(
    private readonly registerCustomerUseCase: RegisterCustomerUseCase,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.registerCustomerUseCase.execute({
      email: dto.email,
      password: dto.password,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
    });
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.loginUseCase.execute({
      email: dto.email,
      password: dto.password,
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Customer')
  getMe(@Req() request: AuthenticatedRequest) {
    return request.user;
  }
}
