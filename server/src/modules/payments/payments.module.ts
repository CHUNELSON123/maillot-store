import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaPaymentRepository } from './infrastructure/repositories/prisma-payment.repository';
import { PaymentRepository } from './domain/repositories/payment.repository';
import { CreatePaymentUseCase } from './application/use-cases/create-payment.use-case';
import { GetPaymentUseCase } from './application/use-cases/get-payment.use-case';
import { UpdatePaymentStatusUseCase } from './application/use-cases/update-payment-status.use-case';
import { PaymentController } from './presentation/controllers/payment.controller';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [AuthModule, OrdersModule],
  controllers: [PaymentController],
  providers: [
    PrismaPaymentRepository,
    CreatePaymentUseCase,
    GetPaymentUseCase,
    UpdatePaymentStatusUseCase,
    {
      provide: PaymentRepository,
      useExisting: PrismaPaymentRepository,
    },
  ],
  exports: [PaymentRepository],
})
export class PaymentsModule {}
