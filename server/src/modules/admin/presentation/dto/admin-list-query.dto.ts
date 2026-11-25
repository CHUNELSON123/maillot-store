import { Type } from 'class-transformer';
import { IsDateString, IsIn, IsInt, IsOptional, IsString, IsUUID, Length, Max, Min } from 'class-validator';

export class AdminListQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  @IsIn(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'PAID', 'FAILED', 'IN_TRANSIT', 'ASSIGNED', 'OUT_FOR_DELIVERY', 'ACTIVE', 'INACTIVE', 'IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'])
  status?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  brandId?: string;

  @IsOptional()
  @IsUUID()
  roleId?: string;

  @IsOptional()
  @IsIn(['WEBSITE', 'WALK_IN', 'WHATSAPP', 'PHONE'])
  source?: string;

  @IsOptional()
  @IsIn(['PENDING', 'PAID', 'FAILED', 'CANCELLED'])
  paymentStatus?: string;

  @IsOptional()
  @IsIn(['MTN Mobile Money', 'Orange Money', 'Bank Card', 'Cash Before Delivery'])
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  provider?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsIn(['WEBSITE', 'ADMIN', 'UNKNOWN'])
  registrationSource?: string;

}
