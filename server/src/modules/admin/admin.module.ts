import { Module } from '@nestjs/common';
import { AdminReadRepository } from './domain/repositories/admin-read.repository';
import { GetAdminRecordsUseCase } from './application/use-cases/get-admin-records.use-case';
import { PrismaAdminReadRepository } from './infrastructure/repositories/prisma-admin-read.repository';
import { AdminReadController } from './presentation/controllers/admin-read.controller';
import { CreateAdminUserUseCase } from './application/use-cases/create-admin-user.use-case';
import { AdminAuthController } from './presentation/controllers/admin-auth.controller';
import { RegisterAdministratorUseCase } from './application/use-cases/register-administrator.use-case';
import { LoginAdministratorUseCase } from './application/use-cases/login-administrator.use-case';
import { AdminAuthRepository } from './domain/repositories/admin-auth.repository';
import { PrismaAdminAuthRepository } from './infrastructure/repositories/prisma-admin-auth.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AdminReadController, AdminAuthController],
  providers: [
    GetAdminRecordsUseCase,
    CreateAdminUserUseCase,
    RegisterAdministratorUseCase,
    LoginAdministratorUseCase,
    PrismaAdminReadRepository,
    PrismaAdminAuthRepository,
    { provide: AdminAuthRepository, useExisting: PrismaAdminAuthRepository },
    { provide: AdminReadRepository, useExisting: PrismaAdminReadRepository },
  ],
})
export class AdminModule {}
