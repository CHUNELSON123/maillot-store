import { Module } from '@nestjs/common';

import { CustomersModule } from '../customers/customers.module';
import { CatalogueModule } from '../catalogue/catalogue.module';

import { CartRepository } from './domain/repositories/cart.repository';
import { PrismaCartRepository } from './infrastructure/repositories/prisma-cart.repository';

import { GetCartUseCase } from './application/use-cases/get-cart.use-case';
import { AddCartItemUseCase } from './application/use-cases/add-cart-item.use-case';
import { UpdateCartItemUseCase } from './application/use-cases/update-cart-item.use-case';
import { RemoveCartItemUseCase } from './application/use-cases/remove-cart-item.use-case';
import { ClearCartUseCase } from './application/use-cases/clear-cart.use-case';
import { SyncCartUseCase } from './application/use-cases/sync-cart.use-case';

import { CartController } from './presentation/controllers/cart.controller';

@Module({
  imports: [CustomersModule, CatalogueModule],
  controllers: [CartController],
  providers: [
    PrismaCartRepository,
    GetCartUseCase,
    AddCartItemUseCase,
    UpdateCartItemUseCase,
    RemoveCartItemUseCase,
    ClearCartUseCase,
    SyncCartUseCase,
    {
      provide: CartRepository,
      useExisting: PrismaCartRepository,
    },
  ],
  exports: [CartRepository],
})
export class CartModule {}
