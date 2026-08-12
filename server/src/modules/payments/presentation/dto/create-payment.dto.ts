import { IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreatePaymentDto {
  @IsUUID()
  orderId!: string;

  @IsUUID()
  paymentMethodId!: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  transactionReference?: string;
}
