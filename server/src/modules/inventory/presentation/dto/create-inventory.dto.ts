import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateInventoryDto {
  @IsUUID()
  variantId!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  quantity?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  minStock?: number;
}
