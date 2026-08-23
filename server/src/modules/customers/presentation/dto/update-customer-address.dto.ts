import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class UpdateCustomerAddressDto {
  @IsOptional()
  @IsString()
  @Length(3, 255)
  address?: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  city?: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  region?: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  country?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
