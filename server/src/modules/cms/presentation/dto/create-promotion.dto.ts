import {
  IsBoolean,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsIn,
  IsString,
  IsUUID,
  Length,
  Min,
} from 'class-validator';

export class CreatePromotionDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 150)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsString()
  @IsNotEmpty()
  discountType!: string;

  @IsNumber()
  @Min(0)
  discountValue!: number;

  @IsOptional()
  @IsIn(['ALL', 'BRAND', 'CATEGORY', 'PRODUCT'])
  targetType?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  targetIds?: string[];

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
