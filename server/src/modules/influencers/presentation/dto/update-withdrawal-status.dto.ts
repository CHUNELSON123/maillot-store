import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateWithdrawalStatusDto {
  @IsString()
  @IsIn(['PENDING', 'APPROVED', 'REJECTED', 'PAID'])
  status!: string;

  @IsOptional()
  @IsString()
  paymentReference?: string;
}
