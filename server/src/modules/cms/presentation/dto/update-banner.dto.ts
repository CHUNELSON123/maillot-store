import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUrl,
  Length,
} from 'class-validator';

export class UpdateBannerDto {
  @IsOptional()
  @IsString()
  @Length(2, 150)
  title?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  linkUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
