import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateCustomerAddressDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 255)
  address!: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  city!: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  region?: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  country!: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
