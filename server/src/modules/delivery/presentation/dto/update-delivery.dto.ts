import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateDeliveryDto {
  @IsOptional()
  @IsString()
  @Length(1, 30)
  deliveryStatus?: string;

  @IsOptional()
  @IsString()
  @Length(3, 255)
  address?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  trackingNumber?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  provider?: string;
}
