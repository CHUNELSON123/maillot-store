import { IsOptional, IsString, Length } from 'class-validator';

export class UpdatePaymentStatusDto {
  @IsString()
  @Length(1, 30)
  status!: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  transactionReference?: string;
}
