import {
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @IsUUID()
  variantId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateOrderDto {
  @IsString()
  @Length(1, 30)
  source!: string;

  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];

  @IsOptional()
  @IsString()
  @Length(1, 64)
  referralCode?: string;

  @IsOptional()
  @IsString()
  @Length(64, 64)
  referralAttributionToken?: string;

  @IsIn(['mtn', 'orange', 'card', 'cash'])
  paymentMethod!: 'mtn' | 'orange' | 'card' | 'cash';

  @IsOptional()
  @IsString()
  @Length(1, 100)
  guestName?: string;

  @IsOptional()
  @IsEmail()
  guestEmail?: string;

  @IsOptional()
  @IsString()
  @Length(5, 30)
  guestPhone?: string;

  @IsOptional()
  @IsString()
  @Length(64, 128)
  guestAccessToken?: string;

  @IsIn(['DELIVERY', 'PICKUP'])
  deliveryMethod!: 'DELIVERY' | 'PICKUP';

  @IsOptional()
  @IsString()
  @Length(1, 255)
  deliveryAddress?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  deliveryCity?: string;

  @IsOptional()
  @IsString()
  @Length(1, 30)
  deliveryPostalCode?: string;
}
