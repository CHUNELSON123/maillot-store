import { IsIn, IsString } from 'class-validator';

export class UpdateCommissionStatusDto {
  @IsString()
  @IsIn(['PENDING', 'APPROVED', 'PAID'])
  status!: string;
}
