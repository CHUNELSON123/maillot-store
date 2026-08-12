import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateReferralDto {
  @IsUUID()
  @IsNotEmpty()
  influencerId!: string;

  @IsOptional()
  @IsUUID()
  orderId?: string;

  @IsString()
  @IsNotEmpty()
  referralCode!: string;

  @IsString()
  @IsNotEmpty()
  status!: string;
}
