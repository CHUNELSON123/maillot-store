import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateDeliveryDto {
  @IsString()
  @IsNotEmpty()
  orderId!: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 255)
  address!: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  provider?: string;
}
