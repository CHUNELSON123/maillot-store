import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';

import { SupplierController } from './presentation/controllers/supplier.controller';
import { PurchaseController } from './presentation/controllers/purchase.controller';

import { PrismaSupplierRepository } from './infrastructure/repositories/prisma-supplier.repository';
import { PrismaPurchaseRepository } from './infrastructure/repositories/prisma-purchase.repository';

import { SupplierRepository } from './domain/repositories/supplier.repository';
import { PurchaseRepository } from './domain/repositories/purchase.repository';

import { CreateSupplierUseCase } from './application/use-cases/create-supplier.use-case';
import { GetSuppliersUseCase } from './application/use-cases/get-suppliers.use-case';
import { GetSupplierUseCase } from './application/use-cases/get-supplier.use-case';
import { UpdateSupplierUseCase } from './application/use-cases/update-supplier.use-case';

import { CreatePurchaseUseCase } from './application/use-cases/create-purchase.use-case';
import { GetPurchasesUseCase } from './application/use-cases/get-purchases.use-case';
import { GetPurchaseUseCase } from './application/use-cases/get-purchase.use-case';
import { UpdatePurchaseStatusUseCase } from './application/use-cases/update-purchase-status.use-case';

@Module({
  imports: [AuthModule],

  controllers: [SupplierController, PurchaseController],

  providers: [
    PrismaSupplierRepository,
    PrismaPurchaseRepository,

    CreateSupplierUseCase,
    GetSuppliersUseCase,
    GetSupplierUseCase,
    UpdateSupplierUseCase,

    CreatePurchaseUseCase,
    GetPurchasesUseCase,
    GetPurchaseUseCase,
    UpdatePurchaseStatusUseCase,

    {
      provide: SupplierRepository,
      useExisting: PrismaSupplierRepository,
    },

    {
      provide: PurchaseRepository,
      useExisting: PrismaPurchaseRepository,
    },
  ],

  exports: [SupplierRepository, PurchaseRepository],
})
export class SuppliersModule {}
