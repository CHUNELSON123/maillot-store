import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import { UserRepository } from './domain/repositories/user.repository';
import { RegisterCustomerUseCase } from './application/use-cases/register-customer.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { AuthController } from './presentation/controllers/auth.controller';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '1d',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    PrismaUserRepository,
    RegisterCustomerUseCase,
    LoginUseCase,
    {
      provide: UserRepository,
      useExisting: PrismaUserRepository,
    },
  ],
  exports: [UserRepository],
})
export class AuthModule {}
