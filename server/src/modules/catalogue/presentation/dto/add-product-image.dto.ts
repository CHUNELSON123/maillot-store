import { IsBooleanString, IsOptional, IsString, Length } from 'class-validator';

export class AddProductImageDto {
  @IsOptional()
  @IsString()
  @Length(0, 255)
  altText?: string;

  @IsOptional()
  @IsBooleanString()
  isPrimary?: string;
}
