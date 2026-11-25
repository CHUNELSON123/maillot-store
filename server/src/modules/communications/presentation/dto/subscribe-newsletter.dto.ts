import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class SubscribeNewsletterDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @MaxLength(254)
  @IsString()
  contact!: string;

  @IsOptional()
  @IsBoolean()
  whatsappOptIn?: boolean;
}
