import { PaymentEntity } from '../entities/payment.entity';

export interface CreatePaymentData {
  orderId: string;
  customerId: string;
  paymentMethodId: string;
  transactionReference?: string;
}

export interface UpdatePaymentStatusData {
  status: string;
  transactionReference?: string;
}

export abstract class PaymentRepository {
  abstract create(data: CreatePaymentData): Promise<PaymentEntity>;

  abstract findById(paymentId: string): Promise<PaymentEntity | null>;

  abstract findByOrderId(
    orderId: string,
    customerId?: string,
  ): Promise<PaymentEntity | null>;

  abstract updateStatus(
    paymentId: string,
    data: UpdatePaymentStatusData,
  ): Promise<PaymentEntity>;
}
