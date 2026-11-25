import {
  IsBoolean,
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsIn,
  IsString,
  IsUUID,
  Length,
  Min,
} from 'class-validator';

export class UpdatePromotionDto {
  @IsOptional()
  @IsString()
  @Length(2, 150)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  discountType?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountValue?: number;

  @IsOptional()
  @IsIn(['ALL', 'BRAND', 'CATEGORY', 'PRODUCT'])
  targetType?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  targetIds?: string[];

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
