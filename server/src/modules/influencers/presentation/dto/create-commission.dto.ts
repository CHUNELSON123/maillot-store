import { IsUUID } from 'class-validator';

export class CreateCommissionDto {
  @IsUUID()
  referralId: string;
}
