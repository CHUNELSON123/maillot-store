import { IsNumber, IsPositive } from 'class-validator';

export class CreateWithdrawalRequestDto {
  @IsNumber()
  @IsPositive()
  amount!: number;
}
