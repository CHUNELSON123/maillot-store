import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';

import { CustomerController } from './presentation/controllers/customer.controller';

import { PrismaCustomerRepository } from './infrastructure/repositories/prisma-customer.repository';

import { CustomerRepository } from './domain/repositories/customer.repository';

import { GetCustomerProfileUseCase } from './application/use-cases/get-customer-profile.use-case';
import { UpdateCustomerProfileUseCase } from './application/use-cases/update-customer-profile.use-case';
import { GetCustomerAddressesUseCase } from './application/use-cases/get-customer-addresses.use-case';
import { CreateCustomerAddressUseCase } from './application/use-cases/create-customer-address.use-case';
import { UpdateCustomerAddressUseCase } from './application/use-cases/update-customer-address.use-case';
import { DeleteCustomerAddressUseCase } from './application/use-cases/delete-customer-address.use-case';

@Module({
  imports: [AuthModule],

  controllers: [CustomerController],

  providers: [
    PrismaCustomerRepository,

    GetCustomerProfileUseCase,
    UpdateCustomerProfileUseCase,
    GetCustomerAddressesUseCase,
    CreateCustomerAddressUseCase,
    UpdateCustomerAddressUseCase,
    DeleteCustomerAddressUseCase,

    {
      provide: CustomerRepository,
      useExisting: PrismaCustomerRepository,
    },
  ],

  exports: [CustomerRepository],
})
export class CustomersModule {}
