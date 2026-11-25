import { IsIn, IsNumber, IsOptional, IsPositive, Matches } from 'class-validator';

export class CreateWithdrawalRequestDto {
  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsOptional() @IsIn(['MTN', 'ORANGE']) payoutMethod?: 'MTN' | 'ORANGE';
  @IsOptional() @Matches(/^\+?\d{9,15}$/) payoutPhone?: string;
}
