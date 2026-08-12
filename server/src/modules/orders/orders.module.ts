import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaOrderRepository } from './infrastructure/repositories/prisma-order.repository';
import { OrderRepository } from './domain/repositories/order.repository';
import { CreateOrderUseCase } from './application/use-cases/create-order.use-case';
import { GetOrdersUseCase } from './application/use-cases/get-orders.use-case';
import { GetOrderUseCase } from './application/use-cases/get-order.use-case';
import { UpdateOrderStatusUseCase } from './application/use-cases/update-order-status.use-case';
import { OrderController } from './presentation/controllers/order.controller';

@Module({
  imports: [AuthModule],
  controllers: [OrderController],
  providers: [
    PrismaOrderRepository,
    CreateOrderUseCase,
    GetOrdersUseCase,
    GetOrderUseCase,
    UpdateOrderStatusUseCase,
    {
      provide: OrderRepository,
      useExisting: PrismaOrderRepository,
    },
  ],
  exports: [OrderRepository],
})
export class OrdersModule {}
