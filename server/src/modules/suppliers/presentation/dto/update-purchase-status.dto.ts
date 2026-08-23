import { IsIn, IsString } from 'class-validator';

export class UpdatePurchaseStatusDto {
  @IsString()
  @IsIn(['PENDING', 'CONFIRMED', 'CANCELLED'])
  status!: string;
}
