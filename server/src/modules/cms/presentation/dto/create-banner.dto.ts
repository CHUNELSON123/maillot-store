import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Length,
} from 'class-validator';

export class CreateBannerDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 150)
  title!: string;

  @IsString()
  @IsNotEmpty()
  @IsUrl()
  imageUrl!: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  linkUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
