import { Body, Controller, Post } from '@nestjs/common';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { RegisterCustomerUseCase } from '../../application/use-cases/register-customer.use-case';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';

@Controller('auth')
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
}
