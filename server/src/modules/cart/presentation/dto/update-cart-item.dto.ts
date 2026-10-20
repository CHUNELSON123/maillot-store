import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class UpdateCartItemDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  quantity?: number;

  @IsOptional()
  @IsUUID()
  variantId?: string;
}
