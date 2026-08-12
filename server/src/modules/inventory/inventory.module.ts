import { Module } from '@nestjs/common';
import { PrismaInventoryRepository } from './infrastructure/repositories/prisma-inventory.repository';
import { InventoryRepository } from './domain/repositories/inventory.repository';
import { CreateInventoryUseCase } from './application/use-cases/create-inventory.use-case';
import { GetInventoryUseCase } from './application/use-cases/get-inventory.use-case';
import { UpdateInventoryUseCase } from './application/use-cases/update-inventory.use-case';
import { GetLowStockUseCase } from './application/use-cases/get-low-stock.use-case';
import { InventoryController } from './presentation/controllers/inventory.controller';

import { PrismaInventoryMovementRepository } from './infrastructure/repositories/prisma-inventory-movement.repository';
import { InventoryMovementRepository } from './domain/repositories/inventory-movement.repository';
import { CreateInventoryMovementUseCase } from './application/use-cases/create-inventory-movement.use-case';
import { GetInventoryMovementsUseCase } from './application/use-cases/get-inventory-movements.use-case';
import { InventoryMovementController } from './presentation/controllers/inventory-movement.controller';

@Module({
  controllers: [InventoryController, InventoryMovementController],
  providers: [
    PrismaInventoryRepository,
    CreateInventoryUseCase,
    GetInventoryUseCase,
    UpdateInventoryUseCase,
    GetLowStockUseCase,

    PrismaInventoryMovementRepository,
    CreateInventoryMovementUseCase,
    GetInventoryMovementsUseCase,

    {
      provide: InventoryRepository,
      useExisting: PrismaInventoryRepository,
    },
    {
      provide: InventoryMovementRepository,
      useExisting: PrismaInventoryMovementRepository,
    },
  ],
  exports: [InventoryRepository, InventoryMovementRepository],
})
export class InventoryModule {}
