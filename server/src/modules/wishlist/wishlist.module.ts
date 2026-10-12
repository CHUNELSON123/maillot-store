import { Module } from '@nestjs/common';

import { CustomersModule } from '../customers/customers.module';
import { CatalogueModule } from '../catalogue/catalogue.module';

import { WishlistRepository } from './domain/repositories/wishlist.repository';
import { PrismaWishlistRepository } from './infrastructure/repositories/prisma-wishlist.repository';

import { GetWishlistUseCase } from './application/use-cases/get-wishlist.use-case';
import { AddWishlistItemUseCase } from './application/use-cases/add-wishlist-item.use-case';
import { RemoveWishlistItemUseCase } from './application/use-cases/remove-wishlist-item.use-case';

import { WishlistController } from './presentation/controllers/wishlist.controller';

@Module({
  imports: [CustomersModule, CatalogueModule],
  controllers: [WishlistController],
  providers: [
    PrismaWishlistRepository,
    GetWishlistUseCase,
    AddWishlistItemUseCase,
    RemoveWishlistItemUseCase,
    {
      provide: WishlistRepository,
      useExisting: PrismaWishlistRepository,
    },
  ],
})
export class WishlistModule {}