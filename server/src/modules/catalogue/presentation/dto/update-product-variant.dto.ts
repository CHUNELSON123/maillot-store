import { IsNumber, IsOptional, IsString, Length, Min } from 'class-validator';

export class UpdateProductVariantDto {
  @IsOptional()
  @IsString()
  @Length(2, 100)
  sku?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  size?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  color?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  edition?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  status?: string;
}
