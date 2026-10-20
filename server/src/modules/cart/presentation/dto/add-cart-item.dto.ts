import { IsInt, IsNotEmpty, IsOptional, IsUUID, Min } from 'class-validator';

export class AddCartItemDto {
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  @IsOptional()
  @IsUUID()
  variantId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;
}
