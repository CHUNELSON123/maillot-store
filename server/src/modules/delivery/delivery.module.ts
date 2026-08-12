import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaDeliveryRepository } from './infrastructure/repositories/prisma-delivery.repository';
import { DeliveryRepository } from './domain/repositories/delivery.repository';
import { CreateDeliveryUseCase } from './application/use-cases/create-delivery.use-case';
import { GetDeliveryUseCase } from './application/use-cases/get-delivery.use-case';
import { UpdateDeliveryUseCase } from './application/use-cases/update-delivery.use-case';
import { DeliveryController } from './presentation/controllers/delivery.controller';

@Module({
  imports: [AuthModule],
  controllers: [DeliveryController],
  providers: [
    PrismaDeliveryRepository,
    CreateDeliveryUseCase,
    GetDeliveryUseCase,
    UpdateDeliveryUseCase,
    {
      provide: DeliveryRepository,
      useExisting: PrismaDeliveryRepository,
    },
  ],
  exports: [DeliveryRepository],
})
export class DeliveryModule {}
