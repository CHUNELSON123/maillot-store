import { IsBooleanString, IsOptional, IsString, IsUrl, Length } from 'class-validator';

export class AddProductImageDto {
  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  imageUrl?: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  altText?: string;

  @IsOptional()
  @IsBooleanString()
  isPrimary?: string;
}
